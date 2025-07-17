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
                        notificationService.createNotificationForSpecificUser(content,
                                        Notification.NotificationType.SYSTEM, renter.getUserId());
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
                try {
                        Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(status.toLowerCase());
                        booking.setStatus(newStatus);

                        // Cập nhật trạng thái xe dựa trên trạng thái booking
                        Car car = booking.getCar();
                        if (car != null) {
                                if (newStatus == Booking.BookingStatus.ongoing
                                                || newStatus == Booking.BookingStatus.approved) {
                                        car.setStatus("rented");
                                        log.info("Updated car status to 'rented' for carId: {}", car.getLicensePlate());
                                } else if (newStatus == Booking.BookingStatus.completed
                                                || newStatus == Booking.BookingStatus.cancelled) {
                                        car.setStatus("available");
                                        log.info("Updated car status to 'available' for carId: {}",
                                                        car.getLicensePlate());
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
                                                        wallet.setTotalDebt(Math.max(0,
                                                                        wallet.getTotalDebt() - payment.getAmount()));
                                                        wallet.setBalance(wallet.getTotalProfit()
                                                                        - wallet.getTotalDebt());
                                                        ownerWalletRepository.save(wallet);
                                                }
                                        }
                                }
                        }

                } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid status: " + status);
                }
                return bookingRepository.save(booking);
        }

        public Booking getBookingById(Integer id) {
                return bookingRepository.findById(id).orElse(null);
        }

        public List<Booking> getAllBookings() {
                return bookingRepository.findAll();
        }
}