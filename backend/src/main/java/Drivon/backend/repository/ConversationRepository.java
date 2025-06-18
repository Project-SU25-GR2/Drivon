package Drivon.backend.repository;

import Drivon.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.user1_id = :userId1 AND c.user2_id = :userId2) OR " +
            "(c.user1_id = :userId2 AND c.user2_id = :userId1)")
    Optional<Conversation> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT c FROM Conversation c WHERE c.user1_id = :userId OR c.user2_id = :userId")
    List<Conversation> findConversationsByUserId(@Param("userId") Long userId);

    // Alternative method using native query for better performance
    @Query(value = "SELECT * FROM conversations WHERE " +
            "(user1_id = :userId1 AND user2_id = :userId2) OR " +
            "(user1_id = :userId2 AND user2_id = :userId1) " +
            "LIMIT 1", nativeQuery = true)
    Optional<Conversation> findConversationBetweenUsersNative(@Param("userId1") Long userId1,
            @Param("userId2") Long userId2);
}