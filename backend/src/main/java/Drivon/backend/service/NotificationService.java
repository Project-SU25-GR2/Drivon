package Drivon.backend.service;

import Drivon.backend.entity.Notification;
import Drivon.backend.model.User;
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

    public void addNotificationForAllUsers(String content, Notification.NotificationType type) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            Notification notification = new Notification();
            notification.setUserId(user.getUserId());
            notification.setContent(content);
            notification.setType(type);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElse(null);
    }
} 