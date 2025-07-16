package Drivon.backend.service;

import Drivon.backend.model.Payment;
import Drivon.backend.model.OwnerWallet;
import Drivon.backend.repository.PaymentRepository;
import Drivon.backend.repository.OwnerWalletRepository;
import Drivon.backend.config.PayOSConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentData;

@Service
public class DebtPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(DebtPaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OwnerWalletRepository ownerWalletRepository;

    @Autowired
    private EarningsService earningsService;

    @Autowired
    private PayOSConfig payOSConfig;

    private PayOS payOS;

    @Autowired
    public void init() {
        try {
            payOS = new PayOS(payOSConfig.getClientId(), payOSConfig.getApiKey(), payOSConfig.getChecksumKey());
            logger.info("PayOS initialized successfully for debt payment");
        } catch (Exception e) {
            logger.error("Error initializing PayOS for debt payment", e);
            throw e;
        }
    }

    /**
     * Process debt payment when owner pays their cash debt via banking
     */
    public void processDebtPayment(String orderCode) {
        try {
            // Find the payment record
            Payment payment = paymentRepository.findByOrderCode(orderCode);
            if (payment == null) {
                logger.warn("No payment found for orderCode: {}", orderCode);
                return;
            }

            // Check if this is a debt payment
            if (!"DEBT_PAYMENT".equals(payment.getCarId())) {
                logger.info("Payment {} is not a debt payment, skipping debt processing", orderCode);
                return;
            }

            // Check if payment is successful
            if (!"PAID".equals(payment.getStatus()) && !"SUCCESS".equals(payment.getStatus())) {
                logger.warn("Payment {} is not successful yet, status: {}. Cannot process debt payment.", orderCode,
                        payment.getStatus());
                return;
            }

            Long ownerId = payment.getUserId();
            double paidAmount = payment.getAmount();

            logger.info("Processing debt payment for owner {} amount {}", ownerId, paidAmount);

            // Get owner wallet
            OwnerWallet wallet = ownerWalletRepository.findByOwnerId(ownerId).orElse(null);
            if (wallet == null) {
                logger.warn("No wallet found for owner: {}", ownerId);
                return;
            }

            // Record debt collection in SystemRevenue
            earningsService.recordDebtCollection(ownerId, paidAmount,
                    "Debt payment via banking - " + payment.getPaymentId());

            // Clear/reduce debt from owner wallet
            double currentDebt = wallet.getTotalDebt() != null ? wallet.getTotalDebt() : 0.0;
            double newDebt = Math.max(0, currentDebt - paidAmount);

            wallet.setTotalDebt(newDebt);
            wallet.setBalance(wallet.getTotalProfit() - wallet.getTotalDebt());
            wallet.setUpdatedAt(LocalDateTime.now());

            ownerWalletRepository.save(wallet);

            logger.info("Successfully processed debt payment. Owner {} debt reduced from {} to {}",
                    ownerId, currentDebt, newDebt);

        } catch (Exception e) {
            logger.error("Error processing debt payment for orderCode: {}", orderCode, e);
        }
    }

    /**
     * Check if a payment is a debt payment
     */
    public boolean isDebtPayment(Payment payment) {
        return payment != null && "DEBT_PAYMENT".equals(payment.getCarId());
    }

    /**
     * Create debt payment request using PayOS
     */
    public Map<String, Object> createDebtPaymentRequest(Long ownerId, Double amount, String description,
            String returnUrl, String cancelUrl, String orderCode) {
        try {
            logger.info("Creating debt payment request for owner {} amount {}", ownerId, amount);
            if (ownerId == null || amount == null || amount <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid owner ID or amount");
                return new HashMap<>(error);
            }
            // Sử dụng orderCode truyền từ frontend nếu có
            String finalOrderCode = orderCode != null ? orderCode : String.valueOf(System.currentTimeMillis());
            Long orderCodeLong = null;
            try {
                orderCodeLong = Long.valueOf(finalOrderCode);
            } catch (Exception e) {
                orderCodeLong = System.currentTimeMillis();
            }
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCodeLong)
                    .amount(amount.intValue())
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();
            CheckoutResponseData response = payOS.createPaymentLink(paymentData);
            if (response == null) {
                logger.error("PayOS API returned null response for debt payment");
                Map<String, String> error = new HashMap<>();
                error.put("error", "No response from PayOS API");
                return new HashMap<>(error);
            }
            // Lưu bản ghi PENDING, không trừ nợ
            Payment payment = new Payment();
            payment.setPaymentId("DEBT_" + System.currentTimeMillis());
            payment.setOrderCode(finalOrderCode);
            payment.setAmount(amount);
            payment.setStatus("PENDING");
            payment.setPaymentMethod("bank");
            payment.setPaymentDate(LocalDateTime.now());
            payment.setUserId(ownerId);
            payment.setCarId("DEBT_PAYMENT");
            payment.setAdditionalRequirements("Debt payment to system");
            paymentRepository.save(payment);
            logger.info("Saved PENDING debt payment record: {}", payment);
            Map<String, Object> formattedResponse = new HashMap<>();
            formattedResponse.put("data", response);
            formattedResponse.put("orderCode", finalOrderCode);
            formattedResponse.put("ownerId", ownerId);
            return formattedResponse;
        } catch (Exception e) {
            logger.error("Error creating debt payment request: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new HashMap<>(errorResponse);
        }
    }

    // Xác nhận thanh toán nợ thủ công từ frontend
    public boolean confirmDebtPayment(String orderCode) {
        Payment payment = paymentRepository.findByOrderCode(orderCode);
        if (payment != null && "PENDING".equals(payment.getStatus())) {
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);
            // Trừ nợ thực sự
            processDebtPayment(orderCode);
            return true;
        }
        return false;
    }

    /**
     * Handle debt payment webhook
     */
    public void handleDebtPaymentWebhook(Map<String, Object> webhookData) {
        try {
            logger.info("Received debt payment webhook data: {}", webhookData);

            String orderCode = (String) webhookData.get("orderCode");
            String status = (String) webhookData.get("status");

            if (orderCode == null || status == null) {
                logger.error("Debt payment webhook missing required data: orderCode={}, status={}", orderCode, status);
                throw new IllegalArgumentException("Missing required webhook data");
            }

            // If status is SUCCESS, process the debt payment
            if ("SUCCESS".equalsIgnoreCase(status)) {
                logger.info("Processing successful debt payment for orderCode: {}", orderCode);
                processDebtPayment(orderCode);
            }
        } catch (Exception e) {
            logger.error("Error processing debt payment webhook", e);
            throw new RuntimeException("Error processing debt payment webhook: " + e.getMessage());
        }
    }
}