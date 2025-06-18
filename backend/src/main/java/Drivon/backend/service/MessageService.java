package Drivon.backend.service;

import Drivon.backend.entity.Conversation;
import Drivon.backend.entity.Message;
import Drivon.backend.entity.UserConversation;
import Drivon.backend.entity.UserConversationId;
import Drivon.backend.model.User;
import Drivon.backend.repository.ConversationRepository;
import Drivon.backend.repository.MessageRepository;
import Drivon.backend.repository.UserConversationRepository;
import Drivon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserConversationRepository userConversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, String content) {
        // Find or create conversation between users
        Conversation conversation = findOrCreateConversation(senderId, receiverId);

        // Create and save message
        Message message = new Message();
        message.setConversation_id(conversation.getConversation_id());
        message.setSender_id(senderId);
        message.setContent(content);

        Message savedMessage = messageRepository.save(message);

        // Update user conversations for both users
        updateUserConversations(conversation.getConversation_id(), senderId, receiverId, savedMessage.getMessage_id());

        return savedMessage;
    }

    @Transactional
    private Conversation findOrCreateConversation(Long userId1, Long userId2) {
        // Try to find existing conversation using native query for better performance
        Optional<Conversation> existingConversation = conversationRepository.findConversationBetweenUsersNative(userId1,
                userId2);

        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }

        // If no conversation exists, create a new one
        // Ensure consistent ordering of user IDs to prevent duplicates
        Long smallerUserId = Math.min(userId1, userId2);
        Long largerUserId = Math.max(userId1, userId2);

        // Double-check that no conversation exists with this ordering
        Optional<Conversation> doubleCheck = conversationRepository.findConversationBetweenUsersNative(smallerUserId,
                largerUserId);
        if (doubleCheck.isPresent()) {
            return doubleCheck.get();
        }

        Conversation newConversation = new Conversation();
        newConversation.setUser1_id(smallerUserId);
        newConversation.setUser2_id(largerUserId);

        try {
            Conversation savedConversation = conversationRepository.save(newConversation);

            // Create user conversation records for both users
            createUserConversationRecords(savedConversation.getConversation_id(), userId1, userId2);

            return savedConversation;
        } catch (Exception e) {
            // If save fails due to duplicate key constraint, try to find the existing
            // conversation again
            // This handles race conditions where multiple threads try to create the same
            // conversation
            Optional<Conversation> retryConversation = conversationRepository
                    .findConversationBetweenUsersNative(userId1, userId2);
            if (retryConversation.isPresent()) {
                return retryConversation.get();
            }
            // If still can't find, try with ordered IDs
            retryConversation = conversationRepository.findConversationBetweenUsersNative(smallerUserId, largerUserId);
            if (retryConversation.isPresent()) {
                return retryConversation.get();
            }
            throw e; // Re-throw if still can't find or create
        }
    }

    private void createUserConversationRecords(Long conversationId, Long userId1, Long userId2) {
        // For user 1
        UserConversationId id1 = new UserConversationId();
        id1.setUser_id(userId1);
        id1.setConversation_id(conversationId);

        UserConversation uc1 = new UserConversation();
        uc1.setId(id1);
        userConversationRepository.save(uc1);

        // For user 2
        UserConversationId id2 = new UserConversationId();
        id2.setUser_id(userId2);
        id2.setConversation_id(conversationId);

        UserConversation uc2 = new UserConversation();
        uc2.setId(id2);
        userConversationRepository.save(uc2);
    }

    private void updateUserConversations(Long conversationId, Long senderId, Long receiverId, Long messageId) {
        // Update sender's last seen message
        Optional<UserConversation> senderUC = userConversationRepository.findByUserIdAndConversationId(senderId,
                conversationId);
        if (senderUC.isPresent()) {
            UserConversation uc = senderUC.get();
            uc.setLast_seen_message_id(messageId);
            userConversationRepository.save(uc);
        }
    }

    public List<Message> getConversationMessages(Long conversationId) {
        return messageRepository.findMessagesByConversationId(conversationId);
    }

    public List<Map<String, Object>> getConversations(Long userId) {
        List<UserConversation> userConversations = userConversationRepository.findActiveConversationsByUserId(userId);
        List<Map<String, Object>> conversations = new ArrayList<>();

        for (UserConversation uc : userConversations) {
            Conversation conversation = conversationRepository.findById(uc.getId().getConversation_id()).orElse(null);
            if (conversation != null) {
                // Get the other user in the conversation
                Long otherUserId = conversation.getUser1_id().equals(userId) ? conversation.getUser2_id()
                        : conversation.getUser1_id();

                User otherUser = userRepository.findById(otherUserId).orElse(null);
                if (otherUser != null) {
                    // Get latest message
                    List<Message> latestMessages = messageRepository.findLatestMessagesByConversationId(
                            conversation.getConversation_id(), PageRequest.of(0, 1));

                    Message lastMessage = latestMessages.isEmpty() ? null : latestMessages.get(0);

                    // Count unread messages
                    Long unreadCount = 0L;
                    if (uc.getLast_seen_message_id() != null) {
                        unreadCount = messageRepository.countUnreadMessagesInConversation(
                                conversation.getConversation_id(), userId, uc.getLast_seen_message_id());
                    } else {
                        // If no last seen message, count all messages from other user
                        List<Message> allMessages = messageRepository
                                .findMessagesByConversationId(conversation.getConversation_id());
                        unreadCount = allMessages.stream()
                                .filter(m -> !m.getSender_id().equals(userId))
                                .count();
                    }

                    Map<String, Object> conversationData = Map.of(
                            "conversationId", conversation.getConversation_id(),
                            "id", otherUser.getUserId(),
                            "name", otherUser.getFullName(),
                            "avatar",
                            otherUser.getAvatarUrl() != null ? otherUser.getAvatarUrl()
                                    : "https://ui-avatars.com/api/?name=" + otherUser.getFullName()
                                            + "&background=random",
                            "lastMessage", lastMessage != null ? lastMessage.getContent() : "",
                            "time", lastMessage != null ? lastMessage.getSent_at().toString() : "",
                            "unread", unreadCount);
                    conversations.add(conversationData);
                }
            }
        }

        return conversations;
    }

    public Long getConversationId(Long userId1, Long userId2) {
        Optional<Conversation> conversation = conversationRepository.findConversationBetweenUsers(userId1, userId2);
        return conversation.map(Conversation::getConversation_id).orElse(null);
    }

    @Transactional
    public void markConversationAsRead(Long userId, Long conversationId) {
        // Get the latest message in the conversation
        List<Message> latestMessages = messageRepository.findLatestMessagesByConversationId(
                conversationId, PageRequest.of(0, 1));

        if (!latestMessages.isEmpty()) {
            Long latestMessageId = latestMessages.get(0).getMessage_id();
            userConversationRepository.updateLastSeenMessage(userId, conversationId, latestMessageId);
        }
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    @Transactional
    public void deleteConversationForUser(Long userId, Long otherUserId) {
        Long conversationId = getConversationId(userId, otherUserId);
        if (conversationId != null) {
            userConversationRepository.markAsDeleted(userId, conversationId);
        }
    }
}