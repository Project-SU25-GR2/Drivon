package com.drivon.controller;

import com.drivon.entity.Payment;
import com.drivon.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/save")
    public ResponseEntity<?> savePayment(@RequestBody Map<String, Object> paymentData) {
        try {
            Payment payment = new Payment();

            // Set payment details
            payment.setPaymentId((String) paymentData.get("paymentId"));
            payment.setOrderCode((String) paymentData.get("orderCode"));
            payment.setAmount(((Number) paymentData.get("amount")).doubleValue());
            payment.setStatus((String) paymentData.get("status"));
            payment.setPaymentMethod((String) paymentData.get("paymentMethod"));

            // Set user and car IDs
            payment.setUserId(((Number) paymentData.get("userId")).longValue());
            payment.setCarId((String) paymentData.get("carId"));

            // Set additional information
            payment.setAdditionalRequirements((String) paymentData.get("additionalRequirements"));

            // Parse dates
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            String startDateStr = (String) paymentData.get("rentalStartDate");
            String endDateStr = (String) paymentData.get("rentalEndDate");

            if (startDateStr != null) {
                payment.setRentalStartDate(LocalDateTime.parse(startDateStr, formatter));
            }
            if (endDateStr != null) {
                payment.setRentalEndDate(LocalDateTime.parse(endDateStr, formatter));
            }

            Payment savedPayment = paymentService.savePayment(payment);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment saved successfully",
                    "data", savedPayment));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to save payment: " + e.getMessage()));
        }
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable String paymentId) {
        try {
            Payment payment = paymentService.findByPaymentId(paymentId);
            if (payment != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", payment));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Payment not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error retrieving payment: " + e.getMessage()));
        }
    }
}