package Drivon.backend.controller;

import Drivon.backend.service.DebtPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/debt-payment")
@CrossOrigin(origins = "http://localhost:3000")
public class DebtPaymentController {

    @Autowired
    private DebtPaymentService debtPaymentService;

    /**
     * Create debt payment request
     */
    @PostMapping("/create")
    public ResponseEntity<?> createDebtPayment(@RequestBody Map<String, Object> request) {
        try {
            Long ownerId = Long.valueOf(request.get("ownerId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String description = request.get("description").toString();
            String returnUrl = request.get("returnUrl").toString();
            String cancelUrl = request.get("cancelUrl").toString();

            Map<String, Object> response = debtPaymentService.createDebtPaymentRequest(
                ownerId, amount, description, returnUrl, cancelUrl);

            if (response.containsKey("error")) {
                return ResponseEntity.badRequest().body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create debt payment: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Handle debt payment webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleDebtPaymentWebhook(@RequestBody Map<String, Object> webhookData) {
        try {
            debtPaymentService.handleDebtPaymentWebhook(webhookData);
            return ResponseEntity.ok("Debt payment webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing debt payment webhook: " + e.getMessage());
        }
    }
} 