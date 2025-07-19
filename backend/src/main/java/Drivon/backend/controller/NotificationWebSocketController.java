package Drivon.backend.controller;

import Drivon.backend.entity.Notification;
import Drivon.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Controller
public class NotificationWebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationService notificationService;

    @MessageMapping("/notification.send")
    public void sendNotification(@Payload Map<String, Object> notificationData) {
        logger.info("Received notification request: {}", notificationData);

        try {
            String content = notificationData.get("content").toString();
            String typeStr = notificationData.getOrDefault("type", "SYSTEM").toString();
            String targetTypeStr = notificationData.getOrDefault("targetType", "USER_SPECIFIC").toString();
            Long targetUserId = Long.valueOf(notificationData.get("targetUserId").toString());

            Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
            Notification.TargetType targetType = Notification.TargetType.valueOf(targetTypeStr);

            logger.info("Processing notification for user {}: {}", targetUserId, content);

            // Tạo thông báo
            Notification savedNotification = notificationService.createNotificationForSpecificUser(content, type, targetUserId);
            logger.info("Saved notification: {}", savedNotification);

            // Gửi thông báo cho user cụ thể
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(targetUserId),
                    "/notifications/new",
                    Map.of(
                            "notificationId", savedNotification.getNotificationId(),
                            "content", content,
                            "type", type.toString(),
                            "targetType", targetType.toString(),
                            "createdAt", savedNotification.getCreatedAt().toString()
                    ));
            logger.info("Notification sent to user successfully");

        } catch (Exception e) {
            logger.error("Error processing notification: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/notification.broadcast")
    public void broadcastNotification(@Payload Map<String, Object> notificationData) {
        logger.info("Received broadcast notification request: {}", notificationData);

        try {
            String content = notificationData.get("content").toString();
            String typeStr = notificationData.getOrDefault("type", "SYSTEM").toString();
            String targetTypeStr = notificationData.getOrDefault("targetType", "ALL_USERS").toString();

            Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
            Notification.TargetType targetType = Notification.TargetType.valueOf(targetTypeStr);

            logger.info("Processing broadcast notification: {} for target: {}", content, targetType);

            Notification savedNotification = null;

            // Tạo thông báo theo loại
            switch (targetType) {
                case ALL_USERS:
                    savedNotification = notificationService.createNotificationForAllUsers(content, type);
                    break;
                case OWNER_ONLY:
                    savedNotification = notificationService.createNotificationForOwners(content, type);
                    break;
                case ADMIN_ONLY:
                    savedNotification = notificationService.createNotificationForAdmins(content, type);
                    break;
                case USER_SPECIFIC:
                    Long targetUserId = Long.valueOf(notificationData.get("targetUserId").toString());
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
                            ));
                    return;
            }

            // Gửi broadcast cho tất cả user
            messagingTemplate.convertAndSend(
                    "/notifications/broadcast",
                    Map.of(
                            "notificationId", savedNotification.getNotificationId(),
                            "content", content,
                            "type", type.toString(),
                            "targetType", targetType.toString(),
                            "createdAt", savedNotification.getCreatedAt().toString()
                    ));
            logger.info("Broadcast notification sent successfully");

        } catch (Exception e) {
            logger.error("Error processing broadcast notification: {}", e.getMessage(), e);
        }
    }
}
