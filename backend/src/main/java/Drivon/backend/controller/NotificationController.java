package Drivon.backend.controller;

import Drivon.backend.entity.Notification;
import Drivon.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    // Admin thêm thông báo cho tất cả user
    @PreAuthorize("hasRole('ADMIN') or hasRole('admin')")
    @PostMapping
    public ResponseEntity<?> addNotification(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String typeStr = body.getOrDefault("type", "SYSTEM");
        Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
        notificationService.addNotificationForAllUsers(content, type);
        return ResponseEntity.ok("Notification sent to all users");
    }

    // User lấy thông báo của mình
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        // principal.getName() là email, cần lấy userId từ email
        // Giả sử có hàm getUserIdByEmail trong NotificationService
        Long userId = notificationService.getUserIdByEmail(principal.getName());
        List<Notification> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    // User đánh dấu đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Marked as read");
    }
} 