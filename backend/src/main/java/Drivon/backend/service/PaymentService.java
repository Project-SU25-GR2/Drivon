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

@Service
public class PaymentService {

    @Autowired
    private PayOSConfig payOSConfig;

    private PayOS payOS;

    @Autowired
    public void init() {
        payOS = new PayOS(payOSConfig.getClientId(), payOSConfig.getApiKey(), payOSConfig.getChecksumKey());
    }

    public Map<String, Object> createPaymentRequest(PaymentRequest request) {
        try {
            // Validate request
            if (request.getOrderCode() == null) {
                throw new IllegalArgumentException("Order code is required");
            }
            if (request.getAmount() == null || request.getAmount() < 1000) {
                throw new IllegalArgumentException("Amount must be at least 1000 VND");
            }
            if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Description is required");
            }

            // Create payment data using PayOS SDK
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(request.getOrderCode())
                    .amount(request.getAmount())
                    .description(request.getDescription())
                    .returnUrl(request.getReturnUrl())
                    .cancelUrl(request.getCancelUrl())
                    .build();

            System.out.println("Sending request to PayOS with data: " + paymentData);

            // Create payment link using PayOS SDK
            CheckoutResponseData response = payOS.createPaymentLink(paymentData);

            if (response == null) {
                throw new RuntimeException("No response from PayOS API");
            }

            System.out.println("Received response from PayOS: " + response);

            // Create a new response map with the expected structure
            Map<String, Object> formattedResponse = new HashMap<>();
            formattedResponse.put("data", response);

            return formattedResponse;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return errorResponse;
        }
    }
}