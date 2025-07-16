package Drivon.backend.service;

import Drivon.backend.model.Payment;
import Drivon.backend.model.OwnerWallet;
import Drivon.backend.repository.PaymentRepository;
import Drivon.backend.repository.OwnerWalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;

@Service
public class DebtPaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(DebtPaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OwnerWalletRepository ownerWalletRepository;
    
    @Autowired
    private EarningsService earningsService;
    
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
                logger.info("Payment {} is not successful yet, status: {}", orderCode, payment.getStatus());
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
} 