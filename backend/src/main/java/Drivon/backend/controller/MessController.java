package Drivon.backend.controller;

import Drivon.backend.entity.Message;
import Drivon.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> request) {
        Long senderId = Long.valueOf(request.get("sender_id").toString());
        Long receiverId = Long.valueOf(request.get("receiver_id").toString());
        String content = request.get("content").toString();

        Message savedMessage = messageService.sendMessage(senderId, receiverId, content);

        // Send to sender's personal queue
        messagingTemplate.convertAndSendToUser(
                String.valueOf(senderId),
                "/topic/messages",
                savedMessage);

        // Send to receiver's personal queue
        messagingTemplate.convertAndSendToUser(
                String.valueOf(receiverId),
                "/topic/messages",
                savedMessage);

        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        Long conversationId = messageService.getConversationId(userId1, userId2);
        if (conversationId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(messageService.getConversationMessages(conversationId));
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversations(userId));
    }

    @PutMapping("/read/{userId}/{conversationId}")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long userId,
            @PathVariable Long conversationId) {
        messageService.markConversationAsRead(userId, conversationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversation/{userId}/{otherUserId}")
    public ResponseEntity<?> deleteConversationForUser(@PathVariable Long userId, @PathVariable Long otherUserId) {
        messageService.deleteConversationForUser(userId, otherUserId);
        return ResponseEntity.ok().build();
    }
}
