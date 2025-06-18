package Drivon.backend.controller;

import Drivon.backend.entity.Message;
import Drivon.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Controller
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

            // Send to receiver
            String receiverDestination = "/user/" + receiverId + "/topic/messages";
            logger.info("Sending to receiver at: {}", receiverDestination);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(receiverId),
                    "/topic/messages",
                    savedMessage);

            logger.info("Message sent successfully");
        } catch (Exception e) {
            logger.error("Error processing message: {}", e.getMessage(), e);

            // Send error notification to sender
            try {
                Long senderId = Long.valueOf(messageData.get("sender_id").toString());
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(senderId),
                        "/topic/errors",
                        Map.of("error", "Failed to send message. Please try again."));
            } catch (Exception notificationError) {
                logger.error("Failed to send error notification: {}", notificationError.getMessage());
            }
        }
    }
}