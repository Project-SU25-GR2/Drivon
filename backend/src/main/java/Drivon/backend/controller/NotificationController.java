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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Test endpoint để kiểm tra authentication
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(Principal principal) {
        System.out.println("=== TEST AUTH ===");
        System.out.println("Principal: " + (principal != null ? principal.getName() : "null"));
        System.out.println("Principal class: " + (principal != null ? principal.getClass().getName() : "null"));
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "User not authenticated",
                "message", "Principal is null"
            ));
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        System.out.println("User ID from email: " + userId);
        
        if (userId == null) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "User not found",
                "email", principal.getName(),
                "message", "User not found in database"
            ));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Authentication successful",
            "email", principal.getName(),
            "userId", userId
        ));
    }

    // Admin tạo thông báo
    @PreAuthorize("hasRole('ADMIN') or hasRole('admin')")
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> body, Principal principal) {
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

            // Lấy senderId từ principal nếu có
            Long senderId = null;
            if (principal != null) {
                senderId = notificationService.getUserIdByEmail(principal.getName());
            }

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
                        "createdAt", savedNotification.getCreatedAt().toString(),
                        "senderId", senderId // Thêm dòng này
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
                        "createdAt", savedNotification.getCreatedAt().toString(),
                        "senderId", senderId
                    ));
                    break;

                case ADMIN_ONLY:
                    savedNotification = notificationService.createNotificationForAdmins(content, type);
                    // Broadcast cho tất cả user (admin sẽ filter)
                    messagingTemplate.convertAndSend("/notifications/broadcast", Map.of(
                        "notificationId", savedNotification.getNotificationId(),
                        "content", content,
                        "type", type.toString(),
                        "targetType", targetType.toString(),
                        "createdAt", savedNotification.getCreatedAt().toString(),
                        "senderId", senderId
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
                            "createdAt", savedNotification.getCreatedAt().toString(),
                            "senderId", senderId
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
    public ResponseEntity<?> getNotifications(Principal principal) {
        System.out.println("getNotifications called with principal: " + (principal != null ? principal.getName() : "null"));
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        if (userId == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            List<Notification> notifications = notificationService.getNotificationsForUser(userId);
            System.out.println("Found " + notifications.size() + " notifications for user " + userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.out.println("Error getting notifications: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    // User lấy số thông báo chưa đọc
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Principal principal) {
        System.out.println("getUnreadCount called with principal: " + (principal != null ? principal.getName() : "null"));
        
        if (principal == null) {
            System.out.println("Principal is null, returning unauthorized");
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        System.out.println("User ID from email " + principal.getName() + ": " + userId);
        
        if (userId == null) {
            System.out.println("User ID is null, returning not found");
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            Long count = notificationService.getUnreadNotificationCount(userId);
            System.out.println("Unread count for user " + userId + ": " + count);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            System.out.println("Error getting unread count: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    // User đánh dấu đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        System.out.println("markAsRead called for notification ID: " + id);
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        if (userId == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            notificationService.markAsRead(id, userId);
            return ResponseEntity.ok("Marked as read");
        } catch (Exception e) {
            System.out.println("Error marking as read: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    // User đánh dấu tất cả đã đọc
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        System.out.println("markAllAsRead called with principal: " + (principal != null ? principal.getName() : "null"));
        
        if (principal == null) {
            System.out.println("Principal is null, returning unauthorized");
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        System.out.println("User ID from email " + principal.getName() + ": " + userId);
        
        if (userId == null) {
            System.out.println("User ID is null, returning not found");
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            System.out.println("Error marking all as read: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    // User lấy danh sách thông báo đã đọc
    @GetMapping("/read-ids")
    public ResponseEntity<?> getReadNotificationIds(Principal principal) {
        System.out.println("getReadNotificationIds called with principal: " + (principal != null ? principal.getName() : "null"));
        
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        Long userId = notificationService.getUserIdByEmail(principal.getName());
        if (userId == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            List<Long> readIds = notificationService.getReadNotificationIds(userId);
            return ResponseEntity.ok(Map.of("readIds", readIds));
        } catch (Exception e) {
            System.out.println("Error getting read notification ids: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    // Admin xoá thông báo
    @PreAuthorize("hasRole('ADMIN') or hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notification deleted successfully");
    }

    // Admin cập nhật thông báo
    @PreAuthorize("hasRole('ADMIN') or hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        String typeStr = (String) body.getOrDefault("type", "SYSTEM");
        String targetTypeStr = (String) body.getOrDefault("targetType", "ALL_USERS");
        Long targetUserId = body.get("targetUserId") != null ? Long.valueOf(body.get("targetUserId").toString()) : null;
        Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
        Notification.TargetType targetType = Notification.TargetType.valueOf(targetTypeStr);
        Notification updated = notificationService.updateNotification(id, content, type, targetType, targetUserId);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.badRequest().body("Notification not found");
        }
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        // Trả về chỉ thông báo USER_SPECIFIC của user này
        return notificationService.getNotificationsForUser(userId).stream()
            .filter(n -> n.getTargetType() == Notification.TargetType.USER_SPECIFIC && n.getTargetUserId() != null && n.getTargetUserId().equals(userId))
            .toList();
    }
} 