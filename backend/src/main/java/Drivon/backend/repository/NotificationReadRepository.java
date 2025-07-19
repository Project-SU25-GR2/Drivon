package Drivon.backend.repository;

import Drivon.backend.entity.NotificationRead;
import Drivon.backend.entity.NotificationReadId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationReadRepository extends JpaRepository<NotificationRead, NotificationReadId> {
    
    // Kiểm tra xem notification đã được đọc bởi user chưa
    @Query("SELECT nr FROM NotificationRead nr WHERE nr.notificationId = :notificationId AND nr.userId = :userId")
    Optional<NotificationRead> findByNotificationIdAndUserId(@Param("notificationId") Long notificationId, @Param("userId") Long userId);
    
    // Lấy tất cả notification đã đọc của user
    @Query("SELECT nr.notificationId FROM NotificationRead nr WHERE nr.userId = :userId")
    List<Long> findReadNotificationIdsByUserId(@Param("userId") Long userId);
    
    // Đếm số notification đã đọc của user
    @Query("SELECT COUNT(nr) FROM NotificationRead nr WHERE nr.userId = :userId")
    Long countReadNotificationsByUserId(@Param("userId") Long userId);
    
    // Xóa tất cả notification reads của user
    void deleteByUserId(Long userId);
    
    // Xóa notification reads của notification cụ thể
    void deleteByNotificationId(Long notificationId);
} 