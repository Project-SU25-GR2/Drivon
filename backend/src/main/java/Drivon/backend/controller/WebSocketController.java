package Drivon.backend.controller;

import Drivon.backend.entity.Message;
import Drivon.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Controller
@RestController
public class WebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> messageData) {
        logger.info("Received message: {}", messageData);

        try {
            Long senderId = Long.valueOf(messageData.get("sender_id").toString());
            Long receiverId = Long.valueOf(messageData.get("receiver_id").toString());
            String content = messageData.get("content").toString();

            logger.info("Processing message from {} to {}: {}", senderId, receiverId, content);

            // Save message to database
            Message savedMessage = messageService.sendMessage(senderId, receiverId, content);
            logger.info("Saved message: {}", savedMessage);

            // Send to sender
            String senderDestination = "/user/" + senderId + "/topic/messages";
            logger.info("Sending to sender at: {}", senderDestination);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(senderId),
                    "/topic/messages",
                    savedMessage);
            logger.info("Message sent to sender successfully");

            // Send to receiver
            String receiverDestination = "/user/" + receiverId + "/topic/messages";
            logger.info("Sending to receiver at: {}", receiverDestination);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(receiverId),
                    "/topic/messages",
                    savedMessage);
            logger.info("Message sent to receiver successfully");

            logger.info("Message sent successfully to both users");
        } catch (Exception e) {
            logger.error("Error processing message: {}", e.getMessage(), e);

            // Send error notification to sender
            try {
                Long senderId = Long.valueOf(messageData.get("sender_id").toString());
                logger.info("Sending error notification to sender: {}", senderId);
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(senderId),
                        "/topic/errors",
                        Map.of("error", "Failed to send message. Please try again."));
                logger.info("Error notification sent to sender");
            } catch (Exception notificationError) {
                logger.error("Failed to send error notification: {}", notificationError.getMessage());
            }
        }
    }

    @GetMapping("/api/websocket/test/{userId}")
    public String testWebSocketConnection(@PathVariable String userId) {
        logger.info("Testing WebSocket connection for user: {}", userId);

        try {
            // Send a test message to the user
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/topic/messages",
                    Map.of(
                            "message_id", "test-" + System.currentTimeMillis(),
                            "sender_id", 0L,
                            "receiver_id", Long.valueOf(userId),
                            "content", "WebSocket connection test message",
                            "sent_at", new java.util.Date().toString(),
                            "conversation_id", "test-conversation"));

            logger.info("Test message sent to user: {}", userId);
            return "Test message sent to user: " + userId;
        } catch (Exception e) {
            logger.error("Error sending test message to user: {}", userId, e);
            return "Error sending test message: " + e.getMessage();
        }
    }
}