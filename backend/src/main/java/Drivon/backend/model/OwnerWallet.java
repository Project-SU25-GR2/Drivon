package Drivon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "owner_wallet")
public class OwnerWallet {
    @Id
    private Long ownerId; // user_id của chủ xe

    @Column(nullable = false)
    private Double totalProfit = 0.0;

    @Column(nullable = false)
    private Double totalDebt = 0.0;

    @Column(nullable = false)
    private Double balance = 0.0;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();
} 