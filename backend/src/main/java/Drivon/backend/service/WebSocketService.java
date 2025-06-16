package Drivon.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendPaymentStatus(String userId, String status, String message) {
        messagingTemplate.convertAndSend(
                "/topic/payment/" + userId,
                Map.of(
                        "status", status,
                        "message", message));
    }
}