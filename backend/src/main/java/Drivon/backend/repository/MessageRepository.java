package Drivon.backend.repository;

import Drivon.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.conversation_id = :conversationId ORDER BY m.sent_at ASC")
    List<Message> findMessagesByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT m FROM Message m WHERE m.conversation_id = :conversationId ORDER BY m.sent_at DESC")
    List<Message> findLatestMessagesByConversationId(@Param("conversationId") Long conversationId,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation_id = :conversationId AND m.sender_id != :userId AND m.message_id > :lastSeenMessageId")
    Long countUnreadMessagesInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId,
            @Param("lastSeenMessageId") Long lastSeenMessageId);
}