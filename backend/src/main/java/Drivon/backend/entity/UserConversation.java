package Drivon.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_conversations")
@Data
public class UserConversation {
    @EmbeddedId
    private UserConversationId id;

    @Column(name = "last_seen_message_id")
    private Long last_seen_message_id;

    @Column(name = "is_deleted")
    private Boolean is_deleted = false;

    @Column(name = "joined_at")
    private LocalDateTime joined_at;

    @PrePersist
    protected void onCreate() {
        joined_at = LocalDateTime.now();
        if (is_deleted == null) {
            is_deleted = false;
        }
    }
}