package Drivon.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long message_id;

    @Column(name = "sender_id", nullable = false)
    private Long sender_id;

    @Column(name = "receiver_id", nullable = false)
    private Long receiver_id;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "sent_at")
    private LocalDateTime sent_at;

    @Column(name = "is_read")
    private Boolean is_read;

    @PrePersist
    protected void onCreate() {
        sent_at = LocalDateTime.now();
        is_read = false;
    }
} 