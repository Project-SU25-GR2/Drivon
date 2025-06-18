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

    @Column(name = "conversation_id", nullable = false)
    private Long conversation_id;

    @Column(name = "sender_id", nullable = false)
    private Long sender_id;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "sent_at")
    private LocalDateTime sent_at;

    @PrePersist
    protected void onCreate() {
        sent_at = LocalDateTime.now();
    }
}