package Drivon.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type")
    private TargetType targetType;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum NotificationType {
        SYSTEM,     // Thông báo hệ thống
        PROMO       // Khuyến mãi
    }

    public enum TargetType {
        ALL_USERS,      // Tất cả người dùng
        OWNER_ONLY,     // Chỉ chủ xe
        USER_SPECIFIC   // Người dùng cụ thể
    }

    // Constructors
    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String content, NotificationType type, TargetType targetType) {
        this.content = content;
        this.type = type;
        this.targetType = targetType;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String content, NotificationType type, TargetType targetType, Long targetUserId) {
        this.content = content;
        this.type = type;
        this.targetType = targetType;
        this.targetUserId = targetUserId;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    
    public TargetType getTargetType() { return targetType; }
    public void setTargetType(TargetType targetType) { this.targetType = targetType; }
    
    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 