package Drivon.backend.repository;

import Drivon.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
<<<<<<< HEAD

    @Query("SELECT m FROM Message m WHERE (m.sender_id = :userId1 AND m.receiver_id = :userId2) OR (m.sender_id = :userId2 AND m.receiver_id = :userId1) ORDER BY m.sent_at ASC")
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT DISTINCT CASE " +
            "WHEN m.sender_id = :userId THEN m.receiver_id " +
            "ELSE m.sender_id END as otherUserId " +
            "FROM Message m " +
            "WHERE m.sender_id = :userId OR m.receiver_id = :userId")
    List<Long> findConversationPartners(@Param("userId") Long userId);
=======

    @Query("SELECT m FROM Message m WHERE m.conversation_id = :conversationId ORDER BY m.sent_at ASC")
    List<Message> findMessagesByConversationId(@Param("conversationId") Long conversationId);
>>>>>>> a9984380f711087bf45d3999e75e5b6f06f9f60d

    @Query("SELECT m FROM Message m WHERE m.conversation_id = :conversationId ORDER BY m.sent_at DESC")
    List<Message> findLatestMessagesByConversationId(@Param("conversationId") Long conversationId,
            org.springframework.data.domain.Pageable pageable);

<<<<<<< HEAD
    @Modifying
    @Query("UPDATE Message m SET m.is_read = true WHERE m.sender_id = :senderId AND m.receiver_id = :receiverId AND m.is_read = false")
    void markMessagesAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Modifying
    @Query("DELETE FROM Message m WHERE (m.sender_id = :userId1 AND m.receiver_id = :userId2) OR (m.sender_id = :userId2 AND m.receiver_id = :userId1)")
    void deleteConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
=======
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation_id = :conversationId AND m.sender_id != :userId AND m.message_id > :lastSeenMessageId")
    Long countUnreadMessagesInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId,
            @Param("lastSeenMessageId") Long lastSeenMessageId);
>>>>>>> a9984380f711087bf45d3999e75e5b6f06f9f60d
}