import axios from 'axios';

class OnlineStatusService {
    constructor() {
        this.heartbeatInterval = null;
        this.heartbeatIntervalMs = 20000; // 20 giây
        this.currentUserId = null;
        this.isActive = true;
        this.onlineStatusCache = new Map();
        this.statusCheckInterval = null;
        this.statusCheckIntervalMs = 30000; // 30 giây để check lại online status
    }

    /**
     * Bắt đầu heartbeat cho user
     */
    startHeartbeat(userId) {
        this.currentUserId = userId;
        this.isActive = true;
        
        // Gửi heartbeat ngay lập tức
        this.sendHeartbeat();
        
        // Thiết lập interval cho heartbeat
        this.heartbeatInterval = setInterval(() => {
            if (this.isActive) {
                this.sendHeartbeat();
            }
        }, this.heartbeatIntervalMs);

        // Thiết lập interval để check online status của các user khác
        this.startStatusChecking();

        // Xử lý khi tab không active
        this.setupVisibilityHandling();
    }

    /**
     * Dừng heartbeat
     */
    stopHeartbeat() {
        this.isActive = false;
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }

        // Đánh dấu offline ngay lập tức khi dừng heartbeat
        if (this.currentUserId) {
            this.markOffline();
            console.log('Heartbeat stopped, user marked as offline');
        }
    }

    /**
     * Gửi heartbeat đến server
     */
    async sendHeartbeat() {
        if (!this.currentUserId || !this.isActive) return;

        try {
            await axios.post('http://localhost:8080/api/online-status/heartbeat', {
                userId: this.currentUserId
            });
            console.log('Heartbeat sent successfully');
        } catch (error) {
            console.error('Failed to send heartbeat:', error);
        }
    }

    /**
     * Đánh dấu user offline
     */
    async markOffline() {
        if (!this.currentUserId) return;

        try {
            await axios.post('http://localhost:8080/api/online-status/offline', {
                userId: this.currentUserId
            });
            console.log('User marked as offline');
        } catch (error) {
            console.error('Failed to mark user offline:', error);
        }
    }

    /**
     * Kiểm tra trạng thái online của một user
     */
    async checkUserOnlineStatus(userId) {
        try {
            // Clear cache trước để lấy data mới nhất
            this.onlineStatusCache.delete(userId);
            
            const response = await axios.get(`http://localhost:8080/api/online-status/user/${userId}`);
            const isOnline = response.data.isOnline;
            
            // Cập nhật cache
            this.onlineStatusCache.set(userId, isOnline);
            
            return isOnline;
        } catch (error) {
            console.error('Failed to check user online status:', error);
            return false;
        }
    }

    /**
     * Kiểm tra trạng thái online của nhiều user
     */
    async checkUsersOnlineStatus(userIds) {
        try {
            // Clear cache cho các user này
            userIds.forEach(userId => this.onlineStatusCache.delete(userId));
            
            const response = await axios.post('http://localhost:8080/api/online-status/users', {
                userIds: userIds
            });
            
            const onlineStatus = response.data.onlineStatus;
            
            // Cập nhật cache
            Object.entries(onlineStatus).forEach(([userId, isOnline]) => {
                this.onlineStatusCache.set(parseInt(userId), isOnline);
            });
            
            return onlineStatus;
        } catch (error) {
            console.error('Failed to check users online status:', error);
            return {};
        }
    }

    /**
     * Lấy trạng thái online từ cache
     */
    getCachedOnlineStatus(userId) {
        return this.onlineStatusCache.get(userId) || false;
    }

    /**
     * Bắt đầu kiểm tra online status định kỳ
     */
    startStatusChecking() {
        this.statusCheckInterval = setInterval(() => {
            // Clear cache cũ để force refresh
            this.onlineStatusCache.clear();
        }, this.statusCheckIntervalMs);
    }

    /**
     * Xử lý khi tab visibility thay đổi
     */
    setupVisibilityHandling() {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab không active, có thể giảm tần suất heartbeat
                console.log('Tab became hidden');
            } else {
                // Tab active trở lại, gửi heartbeat ngay
                console.log('Tab became visible');
                if (this.currentUserId) {
                    this.sendHeartbeat();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup listener khi service bị destroy
        this.cleanupVisibilityHandler = () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopHeartbeat();
        if (this.cleanupVisibilityHandler) {
            this.cleanupVisibilityHandler();
        }
        this.onlineStatusCache.clear();
    }

    /**
     * Kiểm tra xem service có đang chạy không
     */
    isRunning() {
        return this.heartbeatInterval !== null && this.isActive;
    }

    /**
     * Lấy thông tin về service
     */
    getStatus() {
        return {
            isRunning: this.isRunning(),
            currentUserId: this.currentUserId,
            isActive: this.isActive,
            cacheSize: this.onlineStatusCache.size
        };
    }

    /**
     * Kiểm tra xem heartbeat có đang chạy không
     */
    isHeartbeatActive() {
        return this.heartbeatInterval !== null && this.isActive;
    }
}

// Export singleton instance
const onlineStatusService = new OnlineStatusService();
export default onlineStatusService; 