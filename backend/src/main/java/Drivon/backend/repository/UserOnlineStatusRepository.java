package Drivon.backend.repository;

import Drivon.backend.entity.UserOnlineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserOnlineStatusRepository extends JpaRepository<UserOnlineStatus, Long> {

    @Query("SELECT uos FROM UserOnlineStatus uos WHERE uos.isOnline = true AND uos.lastHeartbeat > :cutoffTime")
    List<UserOnlineStatus> findOnlineUsersAfter(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT uos FROM UserOnlineStatus uos WHERE uos.userId = :userId")
    Optional<UserOnlineStatus> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE UserOnlineStatus uos SET uos.isOnline = :isOnline, uos.lastHeartbeat = :lastHeartbeat WHERE uos.userId = :userId")
    void updateOnlineStatus(@Param("userId") Long userId, @Param("isOnline") Boolean isOnline,
            @Param("lastHeartbeat") LocalDateTime lastHeartbeat);

    @Modifying
    @Query("UPDATE UserOnlineStatus uos SET uos.lastSeen = :lastSeen WHERE uos.userId = :userId")
    void updateLastSeen(@Param("userId") Long userId, @Param("lastSeen") LocalDateTime lastSeen);

    @Query("SELECT uos FROM UserOnlineStatus uos WHERE uos.userId IN :userIds")
    List<UserOnlineStatus> findByUserIds(@Param("userIds") List<Long> userIds);
}