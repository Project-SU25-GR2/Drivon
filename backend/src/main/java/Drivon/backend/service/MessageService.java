package Drivon.backend.service;

import Drivon.backend.entity.Message;
import Drivon.backend.model.User;
import Drivon.backend.repository.MessageRepository;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2);
    }

    public List<Map<String, Object>> getConversations(Long userId) {
        List<Long> partnerIds = messageRepository.findConversationPartners(userId);
        List<Map<String, Object>> conversations = new ArrayList<>();

        for (Long partnerId : partnerIds) {
            User partner = userRepository.findById(partnerId).orElse(null);
            if (partner != null) {
                List<Message> messages = messageRepository.findConversation(userId, partnerId);
                if (!messages.isEmpty()) {
                    Message lastMessage = messages.get(messages.size() - 1);
                    Long unreadCount = messageRepository.countUnreadMessages(userId);

                    Map<String, Object> conversation = Map.of(
                            "id", partner.getUserId(),
                            "name", partner.getFullName(),
                            "avatar",
                            partner.getAvatarUrl() != null ? partner.getAvatarUrl()
                                    : "https://ui-avatars.com/api/?name=" + partner.getFullName()
                                            + "&background=random",
                            "lastMessage", lastMessage.getContent(),
                            "time", lastMessage.getSent_at().toString(),
                            "unread", unreadCount);
                    conversations.add(conversation);
                }
            }
        }

        return conversations;
    }

    @Transactional
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        messageRepository.markMessagesAsRead(senderId, receiverId);
    }

    @Transactional
    public void deleteConversation(Long userId1, Long userId2) {
        messageRepository.deleteConversation(userId1, userId2);
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
}