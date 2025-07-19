package Drivon.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_reads")
@IdClass(NotificationReadId.class)
public class NotificationRead {
    
    @Id
    @Column(name = "notification_id")
    private Long notificationId;
    
    @Id
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    // Constructors
    public NotificationRead() {
        this.readAt = LocalDateTime.now();
    }
    
    public NotificationRead(Long notificationId, Long userId) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.readAt = LocalDateTime.now();
    }
    
    // Getters and setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
} 