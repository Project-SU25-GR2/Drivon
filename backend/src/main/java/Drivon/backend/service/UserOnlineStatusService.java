package Drivon.backend.service;

import Drivon.backend.entity.UserOnlineStatus;
import Drivon.backend.repository.UserOnlineStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserOnlineStatusService {

    @Autowired
    private UserOnlineStatusRepository userOnlineStatusRepository;

    // Cache để lưu trạng thái online (tối ưu performance)
    private final Map<Long, Boolean> onlineStatusCache = new HashMap<>();

    // Timeout cho online status (30 giây)
    private static final int ONLINE_TIMEOUT_SECONDS = 30;

    /**
     * Cập nhật heartbeat cho user
     */
    @Transactional
    public void updateHeartbeat(Long userId) {
        LocalDateTime now = LocalDateTime.now();

        Optional<UserOnlineStatus> existingStatus = userOnlineStatusRepository.findByUserId(userId);

        if (existingStatus.isPresent()) {
            UserOnlineStatus status = existingStatus.get();
            status.setIsOnline(true);
            status.setLastHeartbeat(now);
            status.setLastSeen(now);
            userOnlineStatusRepository.save(status);
        } else {
            // Tạo mới nếu chưa có
            UserOnlineStatus newStatus = new UserOnlineStatus();
            newStatus.setUserId(userId);
            newStatus.setIsOnline(true);
            newStatus.setLastHeartbeat(now);
            newStatus.setLastSeen(now);
            userOnlineStatusRepository.save(newStatus);
        }

        // Cập nhật cache
        onlineStatusCache.put(userId, true);
    }

    /**
     * Đánh dấu user offline
     */
    @Transactional
    public void markUserOffline(Long userId) {
        Optional<UserOnlineStatus> existingStatus = userOnlineStatusRepository.findByUserId(userId);

        if (existingStatus.isPresent()) {
            UserOnlineStatus status = existingStatus.get();
            status.setIsOnline(false);
            status.setLastSeen(LocalDateTime.now());
            userOnlineStatusRepository.save(status);
        }

        // Cập nhật cache
        onlineStatusCache.put(userId, false);
    }

    /**
     * Kiểm tra user có online không
     */
    public boolean isUserOnline(Long userId) {
        // Kiểm tra cache trước
        if (onlineStatusCache.containsKey(userId)) {
            return onlineStatusCache.get(userId);
        }

        // Nếu không có trong cache, query database
        Optional<UserOnlineStatus> status = userOnlineStatusRepository.findByUserId(userId);
        if (status.isPresent()) {
            UserOnlineStatus userStatus = status.get();
            LocalDateTime cutoffTime = LocalDateTime.now().minusSeconds(ONLINE_TIMEOUT_SECONDS);

            // Đơn giản: nếu last_heartbeat > 30 giây trước thì offline
            boolean isOnline = userStatus.getLastHeartbeat().isAfter(cutoffTime);

            // Cập nhật cache
            onlineStatusCache.put(userId, isOnline);
            return isOnline;
        }

        return false;
    }

    /**
     * Lấy trạng thái online của nhiều user
     */
    public Map<Long, Boolean> getUsersOnlineStatus(List<Long> userIds) {
        Map<Long, Boolean> result = new HashMap<>();

        for (Long userId : userIds) {
            result.put(userId, isUserOnline(userId));
        }

        return result;
    }

    /**
     * Lấy danh sách user online
     */
    public List<Long> getOnlineUserIds() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusSeconds(ONLINE_TIMEOUT_SECONDS);

        // Lấy tất cả users và filter theo last_heartbeat
        List<UserOnlineStatus> allUsers = userOnlineStatusRepository.findAll();

        return allUsers.stream()
                .filter(status -> status.getLastHeartbeat().isAfter(cutoffTime))
                .map(UserOnlineStatus::getUserId)
                .toList();
    }

    /**
     * Scheduled task để cleanup offline users (chạy mỗi phút)
     */
    @Scheduled(fixedRate = 60000) // 60 giây
    @Transactional
    public void cleanupOfflineUsers() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusSeconds(ONLINE_TIMEOUT_SECONDS);

        // Lấy tất cả users
        List<UserOnlineStatus> allUsers = userOnlineStatusRepository.findAll();

        int cleanedCount = 0;
        for (UserOnlineStatus status : allUsers) {
            boolean shouldBeOnline = status.getLastHeartbeat().isAfter(cutoffTime);

            // Nếu trạng thái hiện tại khác với trạng thái nên có
            if (status.getIsOnline() != shouldBeOnline) {
                status.setIsOnline(shouldBeOnline);
                userOnlineStatusRepository.save(status);

                // Cập nhật cache
                onlineStatusCache.put(status.getUserId(), shouldBeOnline);
                cleanedCount++;

                System.out
                        .println("Updated user " + status.getUserId() + " to " + (shouldBeOnline ? "online" : "offline")
                                + " (last heartbeat: " + status.getLastHeartbeat() + ")");
            }
        }

        if (cleanedCount > 0) {
            System.out.println("Cleanup completed: " + cleanedCount + " users status updated");
        }
    }

    /**
     * Lấy tất cả online status records (cho debugging)
     */
    public List<Map<String, Object>> getAllOnlineStatus() {
        List<UserOnlineStatus> allStatus = userOnlineStatusRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoffTime = now.minusSeconds(ONLINE_TIMEOUT_SECONDS);

        for (UserOnlineStatus status : allStatus) {
            Map<String, Object> statusMap = new HashMap<>();
            statusMap.put("userId", status.getUserId());
            statusMap.put("isOnlineInDB", status.getIsOnline());
            statusMap.put("lastHeartbeat", status.getLastHeartbeat());
            statusMap.put("lastSeen", status.getLastSeen());
            statusMap.put("createdAt", status.getCreatedAt());
            statusMap.put("updatedAt", status.getUpdatedAt());

            // Tính thời gian từ lần heartbeat cuối
            long secondsSinceHeartbeat = java.time.Duration.between(status.getLastHeartbeat(), now).getSeconds();
            statusMap.put("secondsSinceHeartbeat", secondsSinceHeartbeat);

            // Trạng thái thực tế dựa trên last_heartbeat
            boolean actualOnlineStatus = status.getLastHeartbeat().isAfter(cutoffTime);
            statusMap.put("actualOnlineStatus", actualOnlineStatus);
            statusMap.put("shouldBeOffline", !actualOnlineStatus);
            statusMap.put("statusMismatch", status.getIsOnline() != actualOnlineStatus);

            result.add(statusMap);
        }

        return result;
    }

    /**
     * Force cleanup ngay lập tức (cho testing)
     */
    @Transactional
    public int forceCleanup() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusSeconds(ONLINE_TIMEOUT_SECONDS);

        // Lấy tất cả users
        List<UserOnlineStatus> allUsers = userOnlineStatusRepository.findAll();

        int cleanedCount = 0;
        for (UserOnlineStatus status : allUsers) {
            boolean shouldBeOnline = status.getLastHeartbeat().isAfter(cutoffTime);

            // Nếu trạng thái hiện tại khác với trạng thái nên có
            if (status.getIsOnline() != shouldBeOnline) {
                status.setIsOnline(shouldBeOnline);
                userOnlineStatusRepository.save(status);

                // Cập nhật cache
                onlineStatusCache.put(status.getUserId(), shouldBeOnline);
                cleanedCount++;

                System.out.println("Force cleanup: Updated user " + status.getUserId() + " to "
                        + (shouldBeOnline ? "online" : "offline") + " (last heartbeat: " + status.getLastHeartbeat()
                        + ")");
            }
        }

        if (cleanedCount > 0) {
            System.out.println("Force cleanup completed: " + cleanedCount + " users status updated");
        }

        return cleanedCount;
    }

    /**
     * Clear cache khi cần
     */
    public void clearCache() {
        onlineStatusCache.clear();
    }

    /**
     * Remove user from cache (khi user logout)
     */
    public void removeFromCache(Long userId) {
        onlineStatusCache.remove(userId);
    }
}