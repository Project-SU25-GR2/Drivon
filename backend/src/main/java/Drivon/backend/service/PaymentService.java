package Drivon.backend.service;

import Drivon.backend.config.PayOSConfig;
import Drivon.backend.model.PaymentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentData;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PayOSConfig payOSConfig;

    @Autowired
    private WebSocketService webSocketService;

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

            if (orderCode == null || status == null || userId == null) {
                throw new IllegalArgumentException("Missing required webhook data");
            }

            // Verify webhook signature here if needed

            // Send payment status update via WebSocket
            String message = "Payment " + status.toLowerCase();
            webSocketService.sendPaymentStatus(userId, status, message);

        } catch (Exception e) {
            logger.error("Error processing webhook", e);
            throw new RuntimeException("Error processing webhook: " + e.getMessage());
        }
    }
}