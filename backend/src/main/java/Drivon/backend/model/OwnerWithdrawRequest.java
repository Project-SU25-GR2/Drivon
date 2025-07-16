package Drivon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data
@Entity
@Table(name = "owner_withdraw_requests")
public class OwnerWithdrawRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private Long ownerId;
    private Double amount;
    private String status; // pending, approved, rejected, completed

    @Temporal(TemporalType.TIMESTAMP)
    private Date requestedAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date processedAt;

    private String note;

    private Boolean sign = false;
} 