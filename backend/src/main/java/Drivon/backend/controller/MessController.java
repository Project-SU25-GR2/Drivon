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
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message savedMessage = messageService.sendMessage(message);

        // Send to sender's personal queue
        messagingTemplate.convertAndSendToUser(
                String.valueOf(message.getSender_id()),
                "/topic/messages",
                savedMessage);

        // Send to receiver's personal queue
        messagingTemplate.convertAndSendToUser(
                String.valueOf(message.getReceiver_id()),
                "/topic/messages",
                savedMessage);

        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/{userId1}/{userId2}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        return ResponseEntity.ok(messageService.getConversation(userId1, userId2));
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversations(userId));
    }

    @PutMapping("/read/{senderId}/{receiverId}")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {
        messageService.markMessagesAsRead(senderId, receiverId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        messageService.deleteConversation(userId1, userId2);
        return ResponseEntity.ok().build();
    }
}
