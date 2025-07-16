package Drivon.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_revenue")
public class SystemRevenue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType; // REVENUE_IN, REVENUE_OUT, DEBT_CREATED, DEBT_COLLECTED
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // BANK, CASH
    
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Column(name = "owner_id")
    private Long ownerId;
    
    @Column(name = "booking_id")
    private Integer bookingId;
    
    @Column(name = "payment_id", length = 255)
    private String paymentId;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "status", length = 50)
    private String status; // CONFIRMED, PENDING, CANCELLED
    
    // Default constructor
    public SystemRevenue() {
        this.createdAt = LocalDateTime.now();
        this.transactionDate = LocalDateTime.now();
        this.status = "CONFIRMED";
    }
    
    // Constructor with required fields
    public SystemRevenue(String transactionType, String paymentMethod, Double amount, Long ownerId, String description) {
        this();
        this.transactionType = transactionType;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.ownerId = ownerId;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "SystemRevenue{" +
                "id=" + id +
                ", transactionType='" + transactionType + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", amount=" + amount +
                ", ownerId=" + ownerId +
                ", description='" + description + '\'' +
                ", transactionDate=" + transactionDate +
                ", status='" + status + '\'' +
                '}';
    }
} 