package Drivon.backend.controller;

import Drivon.backend.service.UserOnlineStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/online-status")
@CrossOrigin(origins = "*")
public class UserOnlineStatusController {

    @Autowired
    private UserOnlineStatusService userOnlineStatusService;

    /**
     * Heartbeat endpoint - frontend gọi định kỳ để báo hiệu online
     */
    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, Object>> heartbeat(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        userOnlineStatusService.updateHeartbeat(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Heartbeat updated successfully"));
    }

    /**
     * Kiểm tra trạng thái online của một user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserOnlineStatus(@PathVariable Long userId) {
        boolean isOnline = userOnlineStatusService.isUserOnline(userId);

        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "isOnline", isOnline));
    }

    /**
     * Kiểm tra trạng thái online của nhiều user
     */
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsersOnlineStatus(@RequestBody Map<String, List<Long>> request) {
        List<Long> userIds = request.get("userIds");
        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userIds list is required"));
        }

        Map<Long, Boolean> onlineStatus = userOnlineStatusService.getUsersOnlineStatus(userIds);

        return ResponseEntity.ok(Map.of(
                "onlineStatus", onlineStatus));
    }

    /**
     * Lấy danh sách user online
     */
    @GetMapping("/online-users")
    public ResponseEntity<Map<String, Object>> getOnlineUsers() {
        List<Long> onlineUserIds = userOnlineStatusService.getOnlineUserIds();

        return ResponseEntity.ok(Map.of(
                "onlineUserIds", onlineUserIds,
                "count", onlineUserIds.size()));
    }

    /**
     * Đánh dấu user offline (khi logout)
     */
    @PostMapping("/offline")
    public ResponseEntity<Map<String, Object>> markUserOffline(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        userOnlineStatusService.markUserOffline(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User marked as offline"));
    }

    /**
     * Debug endpoint - hiển thị tất cả online status records
     */
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugOnlineStatus() {
        List<Map<String, Object>> allStatus = userOnlineStatusService.getAllOnlineStatus();

        return ResponseEntity.ok(Map.of(
                "totalRecords", allStatus.size(),
                "records", allStatus));
    }

    /**
     * Force cleanup ngay lập tức (cho testing)
     */
    @PostMapping("/force-cleanup")
    public ResponseEntity<Map<String, Object>> forceCleanup() {
        int cleanedCount = userOnlineStatusService.forceCleanup();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "cleanedCount", cleanedCount,
                "message", "Force cleanup completed"));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "UserOnlineStatusService"));
    }
}