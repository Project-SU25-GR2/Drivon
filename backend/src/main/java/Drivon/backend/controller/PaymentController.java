package Drivon.backend.controller;

import Drivon.backend.model.PaymentRequest;
import Drivon.backend.dto.CashPaymentRequest;
import Drivon.backend.model.Payment;
import Drivon.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
            logger.info("Received payment request: {}", request);
            logger.info(
                    "Request details - orderCode: {}, amount: {}, description: {}, returnUrl: {}, cancelUrl: {}, userId: {}",
                    request.getOrderCode(),
                    request.getAmount(),
                    request.getDescription(),
                    request.getReturnUrl(),
                    request.getCancelUrl(),
                    request.getUserId());

            // Validate request data
            if (request.getOrderCode() == null) {
                logger.error("Order code is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Order code is required"));
            }
            if (request.getAmount() == null || request.getAmount() < 1000) {
                logger.error("Invalid amount: {}", request.getAmount());
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be at least 1000 VND"));
            }
            if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
                logger.error("Description is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "Description is required"));
            }
            if (request.getUserId() == null) {
                logger.error("User ID is null");
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            logger.info("Request validation passed, calling payment service...");
            Map<String, Object> response = paymentService.createPaymentRequest(request);

            if (response.containsKey("error")) {
                logger.error("Error creating payment: {}", response.get("error"));
                return ResponseEntity.badRequest().body(response);
            }

            logger.info("Payment request created successfully: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Unexpected error creating payment: {}", e.getMessage(), e);
            Map<String, String> error = Map.of("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> webhookData) {
        try {
            logger.info("Received webhook data: {}", webhookData);
            paymentService.handleWebhook(webhookData);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing webhook", e);
            return ResponseEntity.internalServerError().body("Error processing webhook: " + e.getMessage());
        }
    }

    @PostMapping("/cash")
    public ResponseEntity<?> createCashPayment(@RequestBody CashPaymentRequest request) {
        try {
            logger.info("Received cash payment request: {}", request);
            logger.info(
                    "Request details - orderCode: {}, amount: {}, userId: {}, carId: {}, startDate: {}, endDate: {}",
                    request.getOrderCode(),
                    request.getAmount(),
                    request.getUserId(),
                    request.getCarId(),
                    request.getRentalStartDate(),
                    request.getRentalEndDate());

            // Validate request data
            if (request.getOrderCode() == null) {
                logger.error("Order code is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Order code is required"));
            }
            if (request.getAmount() == null || request.getAmount() <= 0) {
                logger.error("Invalid amount: {}", request.getAmount());
                return ResponseEntity.badRequest().body(Map.of("error", "Amount must be greater than 0"));
            }
            if (request.getUserId() == null) {
                logger.error("User ID is null");
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            if (request.getCarId() == null) {
                logger.error("Car ID is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Car ID is required"));
            }

            logger.info("Request validation passed, calling payment service...");
            Map<String, Object> response = paymentService.createCashPayment(request);

            if (response.containsKey("error")) {
                logger.error("Error creating cash payment: {}", response.get("error"));
                return ResponseEntity.badRequest().body(response);
            }

            logger.info("Cash payment created successfully: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Unexpected error creating cash payment: {}", e.getMessage(), e);
            Map<String, String> error = Map.of("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelPayment(@RequestBody Map<String, Object> data) {
        try {
            String orderCode = String.valueOf(data.get("orderCode"));
            boolean result = paymentService.cancelPaymentByOrderCode(orderCode);
            if (result) {
                return ResponseEntity.ok(Map.of("message", "Payment cancelled successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment not found or already cancelled"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRentals(@PathVariable String userId) {
        try {
            logger.info("Fetching rentals for user: {}", userId);
            Long userIdLong = Long.parseLong(userId);
            List<Payment> rentals = paymentService.getUserRentals(userIdLong);
            logger.info("Found {} rentals for user {}", rentals.size(), userId);
            return ResponseEntity.ok(rentals);
        } catch (NumberFormatException e) {
            logger.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            logger.error("Error fetching user rentals: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/order/{orderCode}")
    public ResponseEntity<?> getPaymentByOrderCode(@PathVariable String orderCode) {
        try {
            Payment payment = paymentService.getPaymentByOrderCode(orderCode);
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBookingId(@PathVariable int bookingId) {
        try {
            Payment payment = paymentService.getPaymentByBookingId(bookingId);
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}