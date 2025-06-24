package Drivon.backend.controller;

import Drivon.backend.entity.Notification;
import Drivon.backend.model.User;
import Drivon.backend.model.UserRole;
import Drivon.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Admin tạo thông báo
    @PreAuthorize("hasRole('ADMIN') or hasRole('admin')")
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> body) {
        try {
            String content = body.get("content");
            String typeStr = body.getOrDefault("type", "SYSTEM");
            String targetTypeStr = body.getOrDefault("targetType", "ALL_USERS");
            Long targetUserId = body.get("targetUserId") != null ? Long.valueOf(body.get("targetUserId")) : null;

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }

            Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
            Notification.TargetType targetType = Notification.TargetType.valueOf(targetTypeStr);

            Notification savedNotification = null;

            // Tạo thông báo theo loại
            switch (targetType) {
                case ALL_USERS:
                    savedNotification = notificationService.createNotificationForAllUsers(content, type);
                    // Broadcast cho tất cả user
                    messagingTemplate.convertAndSend("/notifications/broadcast", Map.of(
                        "notificationId", savedNotification.getNotificationId(),
                        "content", content,
                        "type", type.toString(),
                        "targetType", targetType.toString(),
                        "createdAt", savedNotification.getCreatedAt().toString()
                    ));
                    break;

                case OWNER_ONLY:
                    savedNotification = notificationService.createNotificationForOwners(content, type);
                    // Broadcast cho tất cả user (họ sẽ filter theo role)
                    messagingTemplate.convertAndSend("/notifications/broadcast", Map.of(
                        "notificationId", savedNotification.getNotificationId(),
                        "content", content,
                        "type", type.toString(),
                        "targetType", targetType.toString(),
                        "createdAt", savedNotification.getCreatedAt().toString()
                    ));
                    break;

                case USER_SPECIFIC:
                    if (targetUserId == null) {
                        return ResponseEntity.badRequest().body("targetUserId is required for USER_SPECIFIC notifications");
                    }
                    savedNotification = notificationService.createNotificationForSpecificUser(content, type, targetUserId);
                    // Gửi chỉ cho user cụ thể
                    messagingTemplate.convertAndSendToUser(
                        String.valueOf(targetUserId),
                        "/notifications/new",
                        Map.of(
                            "notificationId", savedNotification.getNotificationId(),
                            "content", content,
                            "type", type.toString(),
                            "targetType", targetType.toString(),
                            "createdAt", savedNotification.getCreatedAt().toString()
                        )
                    );
                    break;
            }

            return ResponseEntity.ok(Map.of(
                "message", "Notification created successfully",
                "notificationId", savedNotification.getNotificationId()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid type or targetType: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating notification: " + e.getMessage());
        }
    }

    // Admin lấy tất cả thông báo
    @PreAuthorize("hasRole('ADMIN') or hasRole('admin')")
    @GetMapping("/admin/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    // User lấy thông báo của mình
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        System.out.println("getNotifications called with principal: " + (principal != null ? principal.getName() : "null"));
        // Luôn trả về tất cả thông báo trong database
        List<Notification> notifications = notificationService.getAllNotificationsForUser();
        System.out.println("Found " + notifications.size() + " notifications (all in DB)");
        return ResponseEntity.ok(notifications);
    }

    // User lấy số thông báo chưa đọc
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        System.out.println("getUnreadCount called with principal: " + (principal != null ? principal.getName() : "null"));
        
        if (principal == null) {
            System.out.println("Principal is null, returning bad request");
            return ResponseEntity.badRequest().build();
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        System.out.println("User ID from email " + principal.getName() + ": " + userId);
        
        if (userId == null) {
            System.out.println("User ID is null, returning bad request");
            return ResponseEntity.badRequest().build();
        }

        Long count = notificationService.getUnreadNotificationCount(userId);
        System.out.println("Unread count for user " + userId + ": " + count);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // User đánh dấu đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        System.out.println("markAsRead called for notification ID: " + id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Marked as read");
    }

    // User đánh dấu tất cả đã đọc
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        System.out.println("markAllAsRead called with principal: " + (principal != null ? principal.getName() : "null"));
        
        if (principal == null) {
            System.out.println("Principal is null, returning bad request");
            return ResponseEntity.badRequest().build();
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        System.out.println("User ID from email " + principal.getName() + ": " + userId);
        
        if (userId == null) {
            System.out.println("User ID is null, returning bad request");
            return ResponseEntity.badRequest().build();
        }

        List<Notification> unreadNotifications = notificationService.getUnreadNotificationsForUser(userId);
        System.out.println("Marking " + unreadNotifications.size() + " notifications as read for user " + userId);
        
        for (Notification notification : unreadNotifications) {
            notificationService.markAsRead(notification.getNotificationId());
        }

        return ResponseEntity.ok("All notifications marked as read");
    }
} 