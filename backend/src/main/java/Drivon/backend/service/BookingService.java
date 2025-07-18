package Drivon.backend.service;

import Drivon.backend.dto.BookingRequest;
import Drivon.backend.model.Booking;
import Drivon.backend.model.Car;
import Drivon.backend.model.User;
import Drivon.backend.repository.BookingRepository;
import Drivon.backend.repository.CarRepository;
import Drivon.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import Drivon.backend.service.NotificationService;
import Drivon.backend.entity.Notification;
import Drivon.backend.repository.OwnerWalletRepository;
import Drivon.backend.repository.PaymentRepository;
import Drivon.backend.model.OwnerWallet;
import Drivon.backend.model.Payment;
import java.time.LocalDateTime;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import Drivon.backend.model.CancelRequest;
import Drivon.backend.repository.CancelRequestRepository;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final OwnerWalletRepository ownerWalletRepository;
    private final PaymentRepository paymentRepository;
    private final EarningsService earningsService;
    private final SimpMessagingTemplate messagingTemplate;
    private final CancelRequestRepository cancelRequestRepository;

    public Booking createBooking(BookingRequest bookingRequest) {
        User renter = userRepository.findById(bookingRequest.getRenterId())
                .orElseThrow(() -> new RuntimeException(
                        "User not found with id: " + bookingRequest.getRenterId()));
        Car car = carRepository.findById(bookingRequest.getCarId())
                .orElseThrow(() -> new RuntimeException(
                        "Car not found with id: " + bookingRequest.getCarId()));

        Booking booking = Booking.builder()
                .renter(renter)
                .car(car)
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .pickupLocation(bookingRequest.getPickupLocation())
                .dropoffLocation(bookingRequest.getDropoffLocation())
                .totalPrice(bookingRequest.getTotalPrice())
                .status(Booking.BookingStatus.pending)
                .build();

        log.info("Attempting to save booking: {}", booking);

        try {
            Booking savedBooking = bookingRepository.saveAndFlush(booking);
            log.info("Saved and flushed booking successfully with ID: {}", savedBooking.getId());
            // Gửi notification cho user khi đặt xe thành công
            String content = "Your car booking was successful. Booking ID: " + savedBooking.getId();
            notificationService.createNotificationForSpecificUser(content, Notification.NotificationType.SYSTEM,
                    renter.getUserId());
            // Gửi real-time notification cho renter
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(renter.getUserId()),
                    "/notifications/new",
                    java.util.Map.of(
                            "content", content,
                            "type", Notification.NotificationType.SYSTEM.toString(),
                            "targetType", Notification.TargetType.USER_SPECIFIC.toString(),
                            "createdAt", java.time.LocalDateTime.now().toString()));
            // Gửi notification cho owner khi có booking mới
            if (car.getOwnerId() != null) {
                User owner = userRepository.findById(car.getOwnerId().longValue()).orElse(null);
                if (owner != null) {
                    StringBuilder ownerContent = new StringBuilder();
                    ownerContent.append("You have a new car booking!\n");
                    ownerContent.append("Booking ID: ").append(savedBooking.getId()).append("\n");
                    ownerContent.append("Renter: ").append(renter.getFullName() != null ? renter.getFullName() : "N/A")
                            .append("\n");
                    ownerContent.append("Email: ").append(renter.getEmail() != null ? renter.getEmail() : "N/A")
                            .append("\n");
                    ownerContent.append("Phone: ").append(renter.getPhone() != null ? renter.getPhone() : "N/A");
                    notificationService.createNotificationForSpecificUser(ownerContent.toString(),
                            Notification.NotificationType.SYSTEM, owner.getUserId());
                    // Gửi real-time notification cho owner
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(owner.getUserId()),
                            "/notifications/new",
                            java.util.Map.of(
                                    "content", ownerContent.toString(),
                                    "type", Notification.NotificationType.SYSTEM.toString(),
                                    "targetType", Notification.TargetType.USER_SPECIFIC.toString(),
                                    "createdAt", java.time.LocalDateTime.now().toString()));
                }
            }
            return savedBooking;
        } catch (Exception e) {
            log.error("Error saving booking to database", e);
            throw new RuntimeException("Could not save booking: " + e.getMessage(), e);
        }
    }

    public List<Booking> getBookingsByOwnerId(Integer ownerId) {
        return bookingRepository.findByCarOwnerId(ownerId);
    }

    public Booking updateBookingStatus(Integer bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        Booking.BookingStatus oldStatus = booking.getStatus();
        Booking.BookingStatus newStatus;
        try {
            newStatus = Booking.BookingStatus.valueOf(status.toLowerCase());
            // Nếu trạng thái không đổi thì không làm gì cả
            if (oldStatus == newStatus) {
                return booking;
            }

            // Cập nhật trạng thái xe dựa trên trạng thái booking
            Car car = booking.getCar();
            if (car != null) {
                if (newStatus == Booking.BookingStatus.ongoing || newStatus == Booking.BookingStatus.approved) {
                    car.setStatus("rented");
                    log.info("Updated car status to 'rented' for carId: {}", car.getLicensePlate());
                } else if (newStatus == Booking.BookingStatus.completed
                        || newStatus == Booking.BookingStatus.cancelled) {
                    car.setStatus("available");
                    log.info("Updated car status to 'available' for carId: {}", car.getLicensePlate());
                }
                carRepository.save(car);
            }

            // Nếu trạng thái là 'completed', cập nhật payment status thành 'PAID' và cập
            // nhật owner_wallet
            if (newStatus == Booking.BookingStatus.completed) {
                paymentService.updatePaymentStatusByBookingId(bookingId, "PAID");
                log.info("Updated payment status to 'PAID' for bookingId: {}", bookingId);
                // --- Cập nhật ví owner ---
                Payment payment = paymentRepository.findByBookingId(bookingId);
                if (payment != null && car != null && car.getOwnerId() != null) {
                    Long ownerId = car.getOwnerId().longValue();
                    double bill = booking.getTotalPrice();
                    String paymentMethod = payment.getPaymentMethod();
                    OwnerWallet wallet = ownerWalletRepository.findByOwnerId(ownerId).orElse(null);
                    if (wallet == null) {
                        wallet = new OwnerWallet();
                        wallet.setOwnerId(ownerId);
                        wallet.setTotalProfit(0.0);
                        wallet.setTotalDebt(0.0);
                        wallet.setBalance(0.0);
                    }
                    if ("bank".equalsIgnoreCase(paymentMethod)) {
                        double profit = bill * 0.98;
                        wallet.setTotalProfit(wallet.getTotalProfit() + profit);
                    } else if ("cash".equalsIgnoreCase(paymentMethod)) {
                        double debt = bill * 0.02;
                        wallet.setTotalDebt(wallet.getTotalDebt() + debt);
                    }
                    wallet.setBalance(wallet.getTotalProfit() - wallet.getTotalDebt());
                    wallet.setUpdatedAt(LocalDateTime.now());
                    ownerWalletRepository.save(wallet);

                    // Record system revenue transaction
                    earningsService.recordSystemRevenue(payment, ownerId);

                    // Check if this is a debt payment (special identifier)
                    if ("DEBT_PAYMENT".equals(payment.getCarId())) {
                        // This is a debt payment, record debt collection
                        earningsService.recordDebtCollection(ownerId, payment.getAmount(),
                                "Debt payment via banking - " + payment.getPaymentId());

                        // Clear the debt from owner wallet
                        if ("bank".equalsIgnoreCase(paymentMethod)) {
                            wallet.setTotalDebt(Math.max(0, wallet.getTotalDebt() - payment.getAmount()));
                            wallet.setBalance(wallet.getTotalProfit() - wallet.getTotalDebt());
                            ownerWalletRepository.save(wallet);
                        }
                    }
                }
            }

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        // Sau khi cập nhật trạng thái booking, gửi notification cho user
        User renter = booking.getRenter();
        if (renter != null) {
            String statusText = booking.getStatus().name().toUpperCase();
            String userContent = String.format("Your booking (ID: %d) has been %s.", booking.getId(), statusText);
            Notification savedNotification = notificationService.createNotificationForSpecificUser(userContent,
                    Notification.NotificationType.SYSTEM, renter.getUserId());
            // Gửi real-time notification cho renter
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(renter.getUserId()),
                    "/notifications/new",
                    java.util.Map.of(
                            "notificationId", savedNotification.getNotificationId(),
                            "content", savedNotification.getContent(),
                            "type", savedNotification.getType().toString(),
                            "targetType", savedNotification.getTargetType().toString(),
                            "createdAt", savedNotification.getCreatedAt().toString()));
        }
        // Gửi notification cho owner (nếu có)
        Car car = booking.getCar();
        if (car != null && car.getOwnerId() != null) {
            User owner = userRepository.findById(car.getOwnerId().longValue()).orElse(null);
            if (owner != null) {
                String ownerContent = String.format("Booking (ID: %d) status has been updated to: %s.", booking.getId(),
                        booking.getStatus().name().toUpperCase());
                Notification ownerNotification = notificationService.createNotificationForSpecificUser(ownerContent,
                        Notification.NotificationType.SYSTEM, owner.getUserId());
                // Gửi real-time notification cho owner
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(owner.getUserId()),
                        "/notifications/new",
                        java.util.Map.of(
                                "notificationId", ownerNotification.getNotificationId(),
                                "content", ownerNotification.getContent(),
                                "type", ownerNotification.getType().toString(),
                                "targetType", ownerNotification.getTargetType().toString(),
                                "createdAt", ownerNotification.getCreatedAt().toString()));
            }
        }
        return bookingRepository.save(booking);
    }

    public Booking getBookingById(Integer id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    public boolean deleteBooking(Integer id) {
        try {
                if (bookingRepository.existsById(id)) {
                        bookingRepository.deleteById(id);
                        return true;
                }
                return false;
        } catch (Exception e) {
                throw new RuntimeException("Error deleting booking: " + e.getMessage());
        }
    }

    // Người thuê yêu cầu huỷ booking khi đang thuê (tạo CancelRequest, không đổi trạng thái booking)
    public CancelRequest requestCancelByRenter(Integer bookingId, Long renterId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getRenter().getUserId().equals(renterId)) {
            throw new RuntimeException("Bạn không phải là người thuê của booking này!");
        }
        if (booking.getStatus() != Booking.BookingStatus.ongoing) {
            throw new RuntimeException("Chỉ có thể yêu cầu huỷ khi đang thuê!");
        }
        // Kiểm tra đã có yêu cầu huỷ chưa
        if (cancelRequestRepository.findByBookingAndStatus(booking, CancelRequest.Status.PENDING).isPresent()) {
            throw new RuntimeException("Đã có yêu cầu huỷ đang chờ xử lý!");
        }
        CancelRequest cancelRequest = new CancelRequest();
        cancelRequest.setBooking(booking);
        cancelRequest.setRequester(booking.getRenter());
        cancelRequest.setRequestedAt(java.time.LocalDateTime.now());
        cancelRequest.setStatus(CancelRequest.Status.PENDING);
        CancelRequest saved = cancelRequestRepository.save(cancelRequest);

        // Gửi notification cho chủ xe
        Car car = booking.getCar();
        if (car != null && car.getOwnerId() != null) {
            User owner = userRepository.findById(car.getOwnerId().longValue()).orElse(null);
            if (owner != null) {
                String content = "The renter has requested to cancel booking #" + bookingId + ". Please accept or reject the request.";
                Notification noti = notificationService.createNotificationForSpecificUser(
                    content,
                    Notification.NotificationType.SYSTEM,
                    owner.getUserId()
                );
                // Gửi notification realtime cho owner
                messagingTemplate.convertAndSendToUser(
                    String.valueOf(owner.getUserId()),
                    "/notifications/new",
                    java.util.Map.of(
                        "notificationId", noti.getNotificationId(),
                        "content", noti.getContent(),
                        "type", noti.getType().toString(),
                        "targetType", Notification.TargetType.USER_SPECIFIC.toString(),
                        "createdAt", noti.getCreatedAt().toString()
                    )
                );
            }
        }
        return saved;
    }

    // Chủ xe xác nhận huỷ booking (duyệt CancelRequest, đổi trạng thái booking)
    public Booking acceptCancelByOwner(Integer bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        Car car = booking.getCar();
        if (car == null || !car.getOwnerId().equals(ownerId.intValue())) {
            throw new RuntimeException("Bạn không phải là chủ xe của booking này!");
        }
        CancelRequest cancelRequest = cancelRequestRepository.findByBookingAndStatus(booking, CancelRequest.Status.PENDING)
            .orElseThrow(() -> new RuntimeException("Không có yêu cầu huỷ nào đang chờ xử lý!"));
        cancelRequest.setStatus(CancelRequest.Status.ACCEPTED);
        cancelRequest.setProcessedAt(java.time.LocalDateTime.now());
        cancelRequestRepository.save(cancelRequest);
        booking.setStatus(Booking.BookingStatus.cancelled);
        car.setStatus("available");
        carRepository.save(car);
        Booking saved = bookingRepository.save(booking);

        // Gửi notification cho người thuê
        User renter = booking.getRenter();
        if (renter != null) {
            String content = "The owner has accepted the cancellation request for booking #" + bookingId + ". The booking has been cancelled.";
            Notification noti = notificationService.createNotificationForSpecificUser(
                content,
                Notification.NotificationType.SYSTEM,
                renter.getUserId()
            );
            // Gửi notification realtime cho renter
            messagingTemplate.convertAndSendToUser(
                String.valueOf(renter.getUserId()),
                "/notifications/new",
                java.util.Map.of(
                    "notificationId", noti.getNotificationId(),
                    "content", noti.getContent(),
                    "type", noti.getType().toString(),
                    "targetType", Notification.TargetType.USER_SPECIFIC.toString(),
                    "createdAt", noti.getCreatedAt().toString()
                )
            );
        }
        return saved;
    }

    // Chủ xe từ chối huỷ booking (từ chối CancelRequest, booking vẫn ongoing)
    public CancelRequest rejectCancelByOwner(Integer bookingId, Long ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        Car car = booking.getCar();
        if (car == null || !car.getOwnerId().equals(ownerId.intValue())) {
            throw new RuntimeException("Bạn không phải là chủ xe của booking này!");
        }
        CancelRequest cancelRequest = cancelRequestRepository.findByBookingAndStatus(booking, CancelRequest.Status.PENDING)
            .orElseThrow(() -> new RuntimeException("Không có yêu cầu huỷ nào đang chờ xử lý!"));
        cancelRequest.setStatus(CancelRequest.Status.REJECTED);
        cancelRequest.setProcessedAt(java.time.LocalDateTime.now());
        CancelRequest saved = cancelRequestRepository.save(cancelRequest);

        // Gửi notification cho người thuê
        User renter = booking.getRenter();
        if (renter != null) {
            String content = "The owner has rejected the cancellation request for booking #" + bookingId + ". The booking remains active.";
            Notification noti = notificationService.createNotificationForSpecificUser(
                content,
                Notification.NotificationType.SYSTEM,
                renter.getUserId()
            );
            // Gửi notification realtime cho renter
            messagingTemplate.convertAndSendToUser(
                String.valueOf(renter.getUserId()),
                "/notifications/new",
                java.util.Map.of(
                    "notificationId", noti.getNotificationId(),
                    "content", noti.getContent(),
                    "type", noti.getType().toString(),
                    "targetType", Notification.TargetType.USER_SPECIFIC.toString(),
                    "createdAt", noti.getCreatedAt().toString()
                )
            );
        }
        return saved;
    }
}