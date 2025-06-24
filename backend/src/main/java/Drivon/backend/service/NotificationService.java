package Drivon.backend.service;

import Drivon.backend.entity.Notification;
import Drivon.backend.model.User;
import Drivon.backend.model.UserRole;
import Drivon.backend.repository.NotificationRepository;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Tạo thông báo cho tất cả user
    public Notification createNotificationForAllUsers(String content, Notification.NotificationType type) {
        Notification notification = new Notification(content, type, Notification.TargetType.ALL_USERS);
        return notificationRepository.save(notification);
    }

    // Tạo thông báo chỉ cho chủ xe
    public Notification createNotificationForOwners(String content, Notification.NotificationType type) {
        Notification notification = new Notification(content, type, Notification.TargetType.OWNER_ONLY);
        return notificationRepository.save(notification);
    }

    // Tạo thông báo cho user cụ thể
    public Notification createNotificationForSpecificUser(String content, Notification.NotificationType type, Long targetUserId) {
        Notification notification = new Notification(content, type, Notification.TargetType.USER_SPECIFIC, targetUserId);
        return notificationRepository.save(notification);
    }

    // Lấy thông báo cho user (dựa trên role và target_type)
    public List<Notification> getNotificationsForUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }
        
        String userRole = user.getRole().toString().toLowerCase();
        return notificationRepository.findNotificationsForUser(userId, userRole);
    }

    // Lấy thông báo chưa đọc cho user
    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }
        
        String userRole = user.getRole().toString().toLowerCase();
        return notificationRepository.findUnreadNotificationsForUser(userId, userRole);
    }

    // Đếm thông báo chưa đọc cho user
    public Long getUnreadNotificationCount(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return 0L;
        }
        
        String userRole = user.getRole().toString().toLowerCase();
        return notificationRepository.countUnreadNotificationsForUser(userId, userRole);
    }

    // Đánh dấu thông báo đã đọc
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    // Lấy tất cả thông báo (cho admin)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    // Lấy user theo ID
    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    // Lấy user ID theo email
    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElse(null);
    }

    // Lấy tất cả user (cho gửi thông báo)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Lấy tất cả owner
    public List<User> getAllOwners() {
        return userRepository.findByRole(UserRole.owner);
    }

    // Lấy tất cả thông báo cho user (không phân biệt role hay target_type)
    public List<Notification> getAllNotificationsForUser() {
        return notificationRepository.findAllNotificationsForUser();
    }
} 