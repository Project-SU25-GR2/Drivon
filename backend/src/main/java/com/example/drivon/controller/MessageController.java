package com.example.drivon.controller;

import com.example.drivon.model.Message;
import com.example.drivon.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public Message sendMessage(@RequestBody Message message) {
        Message savedMessage = messageService.saveMessage(message);
        
        // Send to sender's personal queue
        messagingTemplate.convertAndSendToUser(
            String.valueOf(message.getSender_id()),
            "/topic/messages",
            savedMessage
        );
        
        // Send to receiver's personal queue
        messagingTemplate.convertAndSendToUser(
            String.valueOf(message.getReceiver_id()),
            "/topic/messages",
            savedMessage
        );
        
        return savedMessage;
    }

    // ... existing code ...
} 