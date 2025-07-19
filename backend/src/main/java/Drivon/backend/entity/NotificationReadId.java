package Drivon.backend.entity;

import java.io.Serializable;

public class NotificationReadId implements Serializable {
    private Long notificationId;
    private Long userId;
    
    public NotificationReadId() {}
    
    public NotificationReadId(Long notificationId, Long userId) {
        this.notificationId = notificationId;
        this.userId = userId;
    }
    
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        NotificationReadId that = (NotificationReadId) obj;
        return notificationId.equals(that.notificationId) && userId.equals(that.userId);
    }
    
    @Override
    public int hashCode() {
        return notificationId.hashCode() + 31 * userId.hashCode();
    }
} 