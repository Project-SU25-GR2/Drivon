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

@Controller
public class WebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        logger.info("Received message: {}", message);
        
        try {
            // Save message to database
            Message savedMessage = messageService.saveMessage(message);
            logger.info("Saved message: {}", savedMessage);
            
            // Send to sender
            String senderDestination = "/user/" + message.getSender_id() + "/topic/messages";
            logger.info("Sending to sender at: {}", senderDestination);
            messagingTemplate.convertAndSendToUser(
                String.valueOf(message.getSender_id()),
                "/topic/messages",
                savedMessage
            );
            
            // Send to receiver
            String receiverDestination = "/user/" + message.getReceiver_id() + "/topic/messages";
            logger.info("Sending to receiver at: {}", receiverDestination);
            messagingTemplate.convertAndSendToUser(
                String.valueOf(message.getReceiver_id()),
                "/topic/messages",
                savedMessage
            );
            
            logger.info("Message sent successfully");
        } catch (Exception e) {
            logger.error("Error processing message: {}", e.getMessage(), e);
        }
    }
} 