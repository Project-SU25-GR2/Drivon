package Drivon.backend.controller;

import Drivon.backend.entity.Message;
import Drivon.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
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
}
