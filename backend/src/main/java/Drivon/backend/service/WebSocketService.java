package Drivon.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserOnlineStatusService userOnlineStatusService;

    public void sendPaymentStatus(String userId, String status, String message) {
        messagingTemplate.convertAndSend(
                "/topic/payment/" + userId,
                Map.of(
                        "status", status,
                        "message", message));
    }

    /**
     * Gửi thông báo online status change
     */
    public void sendOnlineStatusChange(Long userId, boolean isOnline) {
        messagingTemplate.convertAndSend(
                "/topic/online-status/" + userId,
                Map.of(
                        "userId", userId,
                        "isOnline", isOnline,
                        "timestamp", System.currentTimeMillis()));
    }

    /**
     * Gửi thông báo cho tất cả user về thay đổi online status
     */
    public void broadcastOnlineStatusChange(Long userId, boolean isOnline) {
        messagingTemplate.convertAndSend(
                "/topic/online-status",
                Map.of(
                        "userId", userId,
                        "isOnline", isOnline,
                        "timestamp", System.currentTimeMillis()));
    }

    /**
     * Gửi message với kiểm tra online status
     */
    public boolean sendMessageToUser(Long userId, String destination, Object payload) {
        // Kiểm tra user có online không trước khi gửi
        if (userOnlineStatusService.isUserOnline(userId)) {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    destination,
                    payload);
            return true;
        }
        return false;
    }
}