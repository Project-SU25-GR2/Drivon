package Drivon.backend.controller;

import Drivon.backend.model.PaymentRequest;
import Drivon.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
}