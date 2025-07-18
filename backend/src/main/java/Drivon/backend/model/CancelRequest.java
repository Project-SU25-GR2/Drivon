package Drivon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cancel_request")
public class CancelRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED
    }
} 