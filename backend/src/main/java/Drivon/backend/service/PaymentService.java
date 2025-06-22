package Drivon.backend.service;

import Drivon.backend.config.PayOSConfig;
import Drivon.backend.model.PaymentRequest;
import Drivon.backend.model.Payment;
import Drivon.backend.dto.CashPaymentRequest;
import Drivon.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentData;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import Drivon.backend.model.PaymentMethod;
import Drivon.backend.model.PaymentStatus;
import java.util.List;
import Drivon.backend.model.Car;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PayOSConfig payOSConfig;

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CarService carService;

    private PayOS payOS;

    @Autowired
    public void init() {
        try {
            logger.info("Initializing PayOS with clientId: {}, apiKey: {}, checksumKey: {}",
                    payOSConfig.getClientId(),
                    payOSConfig.getApiKey(),
                    payOSConfig.getChecksumKey());

            payOS = new PayOS(payOSConfig.getClientId(), payOSConfig.getApiKey(), payOSConfig.getChecksumKey());
            logger.info("PayOS initialized successfully");
        } catch (Exception e) {
            logger.error("Error initializing PayOS", e);
            throw e;
        }
    }

    public Map<String, Object> createCashPayment(CashPaymentRequest request) {
        try {
            // Validate request
            if (request.getOrderCode() == null || request.getAmount() == null ||
                    request.getUserId() == null || request.getCarId() == null) {
                throw new IllegalArgumentException("Missing required fields");
            }

            // Create payment record
            Payment payment = new Payment();
            payment.setPaymentId("CASH_" + System.currentTimeMillis());
            payment.setOrderCode(request.getOrderCode());
            payment.setAmount(request.getAmount());
            payment.setStatus("PENDING");
            payment.setPaymentMethod("cash");
            payment.setPaymentDate(LocalDateTime.now());
            payment.setUserId(request.getUserId());
            payment.setCarId(request.getCarId());
            payment.setAdditionalRequirements(request.getAdditionalRequirements());

            // Convert ISO string dates to LocalDateTime
            if (request.getRentalStartDate() != null) {
                payment.setRentalStartDate(request.getRentalStartDate());
            }
            if (request.getRentalEndDate() != null) {
                payment.setRentalEndDate(request.getRentalEndDate());
            }

            // Set bookingId
            payment.setBookingId(request.getBookingId());

            // Save to database (dùng hàm dùng chung)
            payment = savePayment(payment);
            logger.info("Created cash payment: {}", payment);

            // Cập nhật trạng thái xe thành 'rented'
            Car car = carService.getCarById(payment.getCarId());
            if (car != null) {
                car.setStatus("rented");
                carService.updateCar(car);
                logger.info("Updated car status to 'rented' for carId: {}", car.getLicensePlate());
            }

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("paymentId", payment.getPaymentId());
            response.put("orderCode", payment.getOrderCode());
            response.put("amount", payment.getAmount());
            response.put("status", payment.getStatus());
            response.put("paymentMethod", payment.getPaymentMethod());
            response.put("paymentDate", payment.getPaymentDate());
            response.put("userId", payment.getUserId());
            response.put("carId", payment.getCarId());
            response.put("additionalRequirements", payment.getAdditionalRequirements());
            response.put("rentalStartDate", payment.getRentalStartDate());
            response.put("rentalEndDate", payment.getRentalEndDate());
            response.put("createdAt", payment.getCreatedAt());

            return response;
        } catch (Exception e) {
            logger.error("Error creating cash payment", e);
            throw new RuntimeException("Failed to create cash payment: " + e.getMessage());
        }
    }

    public Map<String, Object> createPaymentRequest(PaymentRequest request) {
        try {
            logger.info("Creating payment request with data: {}", request);
            logger.info("PayOS instance: {}", payOS != null ? "Initialized" : "Not initialized");

            // Validate request
            if (request.getOrderCode() == null) {
                logger.error("Order code is null");
                throw new IllegalArgumentException("Order code is required");
            }
            if (request.getAmount() == null || request.getAmount() < 1000) {
                logger.error("Invalid amount: {}", request.getAmount());
                throw new IllegalArgumentException("Amount must be at least 1000 VND");
            }
            if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
                logger.error("Description is empty");
                throw new IllegalArgumentException("Description is required");
            }
            if (request.getUserId() == null) {
                logger.error("User ID is null");
                throw new IllegalArgumentException("User ID is required");
            }

            // Create payment data using PayOS SDK
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(request.getOrderCode())
                    .amount(request.getAmount())
                    .description(request.getDescription())
                    .returnUrl(request.getReturnUrl())
                    .cancelUrl(request.getCancelUrl())
                    .build();

            logger.info("Created PaymentData object: {}", paymentData);

            // Create payment link using PayOS SDK
            logger.info("Calling PayOS API to create payment link...");
            CheckoutResponseData response = payOS.createPaymentLink(paymentData);

            if (response == null) {
                logger.error("PayOS API returned null response");
                throw new RuntimeException("No response from PayOS API");
            }

            logger.info("Received response from PayOS: {}", response);

            // Lưu luôn bản ghi Payment trạng thái PENDING
            try {
                Payment payment = paymentRepository.findByOrderCode(String.valueOf(request.getOrderCode()));
                if (payment == null) {
                    payment = new Payment();
                    payment.setPaymentId("PAYOS_" + System.currentTimeMillis());
                    payment.setOrderCode(String.valueOf(request.getOrderCode()));
                    payment.setAmount(Double.valueOf(request.getAmount()));
                    payment.setStatus("PAID");
                    payment.setPaymentMethod("bank");
                    payment.setPaymentDate(LocalDateTime.now());
                    payment.setUserId(Long.valueOf(request.getUserId()));
                    payment.setCarId(request.getCarId());
                    payment.setAdditionalRequirements(request.getAdditionalRequirements());
                    if (request.getRentalStartDate() != null) {
                        try {
                            payment.setRentalStartDate(LocalDateTime.parse(request.getRentalStartDate()));
                        } catch (Exception e) {
                            try {
                                payment.setRentalStartDate(java.time.Instant.parse(request.getRentalStartDate())
                                        .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
                            } catch (Exception e2) {
                                logger.warn("Cannot parse rentalStartDate (ISO): {}", request.getRentalStartDate());
                            }
                        }
                    }
                    if (request.getRentalEndDate() != null) {
                        try {
                            payment.setRentalEndDate(LocalDateTime.parse(request.getRentalEndDate()));
                        } catch (Exception e) {
                            try {
                                payment.setRentalEndDate(java.time.Instant.parse(request.getRentalEndDate())
                                        .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
                            } catch (Exception e2) {
                                logger.warn("Cannot parse rentalEndDate (ISO): {}", request.getRentalEndDate());
                            }
                        }
                    }
                    payment.setPromotionCode(request.getPromotionCode());
                    payment.setDiscountPercent(request.getDiscountPercent());
                    if (request.getDiscountPercent() != null) {
                        payment.setAdditionalRequirements((payment.getAdditionalRequirements() != null
                                ? payment.getAdditionalRequirements() + ", "
                                : "") + "Giảm " + request.getDiscountPercent() + "%");
                    }
                    payment.setBookingId(request.getBookingId());
                    savePayment(payment);
                    logger.info("Saved PAID PayOS payment: {}", payment);

                    // Cập nhật trạng thái xe thành 'rented'
                    Car car = carService.getCarById(payment.getCarId());
                    if (car != null) {
                        car.setStatus("rented");
                        carService.updateCar(car);
                        logger.info("Updated car status to 'rented' for carId: {}", car.getLicensePlate());
                    }
                }
            } catch (Exception ex) {
                logger.error("Error saving PAID payment to DB: {}", ex.getMessage(), ex);
            }

            // Create response with payment info
            Map<String, Object> formattedResponse = new HashMap<>();
            formattedResponse.put("data", response);
            formattedResponse.put("orderCode", request.getOrderCode());
            formattedResponse.put("userId", request.getUserId());

            return formattedResponse;
        } catch (Exception e) {
            logger.error("Error creating payment request: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
    }

    public void handleWebhook(Map<String, Object> webhookData) {
        try {
            logger.info("Received webhook data: {}", webhookData);

            String orderCode = (String) webhookData.get("orderCode");
            String status = (String) webhookData.get("status");
            String userId = (String) webhookData.get("userId");
            Double amount = webhookData.get("amount") instanceof Number
                    ? ((Number) webhookData.get("amount")).doubleValue()
                    : null;
            String carId = webhookData.get("carId") != null ? webhookData.get("carId").toString() : null;

            if (orderCode == null || status == null || userId == null) {
                logger.error("Webhook missing required data: orderCode={}, status={}, userId={}", orderCode, status,
                        userId);
                throw new IllegalArgumentException("Missing required webhook data");
            }

            // Nếu status là SUCCESS thì update trạng thái giao dịch
            if ("SUCCESS".equalsIgnoreCase(status)) {
                try {
                    Payment payment = paymentRepository.findByOrderCode(orderCode);
                    if (payment != null) {
                        payment.setStatus("SUCCESS");
                        logger.info("Updating PayOS payment status to SUCCESS: {}", payment);
                        savePayment(payment);
                        logger.info("Updated PayOS payment status to SUCCESS: {}", payment);

                        // Cập nhật trạng thái xe thành 'rented' nếu chưa
                        Car car = carService.getCarById(payment.getCarId());
                        if (car != null && (car.getStatus() == null || !car.getStatus().equals("rented"))) {
                            car.setStatus("rented");
                            carService.updateCar(car);
                            logger.info("Updated car status to 'rented' for carId: {} (webhook)",
                                    car.getLicensePlate());
                        }
                    } else {
                        logger.error("No PAID payment found for orderCode {}. Webhook ignored.", orderCode);
                    }
                } catch (Exception ex) {
                    logger.error("Error updating payment to SUCCESS. Webhook data: {}. Error: {}", webhookData,
                            ex.getMessage(), ex);
                }
            }

            // Send payment status update via WebSocket
            String message = "Payment " + status.toLowerCase();
            webSocketService.sendPaymentStatus(userId, status, message);

        } catch (Exception e) {
            logger.error("Error processing webhook", e);
            throw new RuntimeException("Error processing webhook: " + e.getMessage());
        }
    }

    public List<Payment> getUserRentals(Long userId) {
        try {
            logger.info("Getting rentals for user: {}", userId);
            if (userId == null) {
                throw new IllegalArgumentException("User ID cannot be null");
            }
            List<Payment> rentals = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
            logger.info("Found {} rentals for user {}", rentals.size(), userId);
            return rentals;
        } catch (Exception e) {
            logger.error("Error getting user rentals: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get user rentals: " + e.getMessage());
        }
    }

    // Hàm dùng chung để lưu Payment
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    // API lấy chi tiết payment theo orderCode
    public Payment getPaymentByOrderCode(String orderCode) {
        return paymentRepository.findByOrderCode(orderCode);
    }

    public Payment getPaymentByBookingId(int bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
}