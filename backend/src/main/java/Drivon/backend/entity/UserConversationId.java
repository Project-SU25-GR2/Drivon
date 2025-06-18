package Drivon.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Embeddable
@Data
public class UserConversationId implements Serializable {
    @Column(name = "user_id")
    private Long user_id;

    @Column(name = "conversation_id")
    private Long conversation_id;
}