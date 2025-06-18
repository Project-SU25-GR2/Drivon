package Drivon.backend.repository;

import Drivon.backend.entity.UserConversation;
import Drivon.backend.entity.UserConversationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserConversationRepository extends JpaRepository<UserConversation, UserConversationId> {

    @Query("SELECT uc FROM UserConversation uc WHERE uc.id.user_id = :userId AND uc.is_deleted = false")
    List<UserConversation> findActiveConversationsByUserId(@Param("userId") Long userId);

    @Query("SELECT uc FROM UserConversation uc WHERE uc.id.conversation_id = :conversationId AND uc.is_deleted = false")
    List<UserConversation> findActiveUsersByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT uc FROM UserConversation uc WHERE uc.id.user_id = :userId AND uc.id.conversation_id = :conversationId")
    Optional<UserConversation> findByUserIdAndConversationId(@Param("userId") Long userId,
            @Param("conversationId") Long conversationId);

    @Modifying
    @Query("UPDATE UserConversation uc SET uc.last_seen_message_id = :messageId WHERE uc.id.user_id = :userId AND uc.id.conversation_id = :conversationId")
    void updateLastSeenMessage(@Param("userId") Long userId, @Param("conversationId") Long conversationId,
            @Param("messageId") Long messageId);
}