package Drivon.backend.controller;

import Drivon.backend.model.PaymentRequest;
import Drivon.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
            Map<String, Object> response = paymentService.createPaymentRequest(request);

            if (response.containsKey("error")) {
                return ResponseEntity.badRequest().body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = Map.of("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> webhookData) {
        try {
            // Handle webhook data from PayOS
            // Verify signature and update payment status
            return ResponseEntity.ok("Webhook received");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing webhook: " + e.getMessage());
        }
    }
}