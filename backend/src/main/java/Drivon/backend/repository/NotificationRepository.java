package Drivon.backend.repository;

import Drivon.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Lấy tất cả thông báo
    List<Notification> findAllByOrderByCreatedAtDesc();
    
    // Lấy thông báo cho user cụ thể (dựa trên target_type và role của user)
    @Query("SELECT n FROM Notification n WHERE " +
           "n.targetType = 'ALL_USERS' OR " +
           "(n.targetType = 'OWNER_ONLY' AND :userRole = 'owner') OR " +
           "(n.targetType = 'USER_SPECIFIC' AND n.targetUserId = :userId) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(@Param("userId") Long userId, @Param("userRole") String userRole);
    
    // Lấy thông báo chưa đọc cho user
    @Query("SELECT n FROM Notification n WHERE n.isRead = false AND (" +
           "n.targetType = 'ALL_USERS' OR " +
           "(n.targetType = 'OWNER_ONLY' AND :userRole = 'owner') OR " +
           "(n.targetType = 'USER_SPECIFIC' AND n.targetUserId = :userId)) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotificationsForUser(@Param("userId") Long userId, @Param("userRole") String userRole);
    
    // Đếm thông báo chưa đọc cho user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false AND (" +
           "n.targetType = 'ALL_USERS' OR " +
           "(n.targetType = 'OWNER_ONLY' AND :userRole = 'owner') OR " +
           "(n.targetType = 'USER_SPECIFIC' AND n.targetUserId = :userId))")
    Long countUnreadNotificationsForUser(@Param("userId") Long userId, @Param("userRole") String userRole);
    
    // Lấy tất cả thông báo cho user (không phân biệt target_type hay role)
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findAllNotificationsForUser();
} 