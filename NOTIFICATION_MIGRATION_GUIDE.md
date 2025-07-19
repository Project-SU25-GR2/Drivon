# Hướng dẫn Migration Hệ thống Notification

## Tổng quan thay đổi

Hệ thống notification đã được cập nhật từ cấu trúc cũ (sử dụng cột `is_read` trong bảng `notifications`) sang cấu trúc mới (sử dụng bảng `notification_reads` riêng biệt).

### Thay đổi chính:

1. **Loại bỏ cột `is_read`** từ bảng `notifications`
2. **Thêm bảng `notification_reads`** để theo dõi trạng thái đọc của từng user
3. **Thêm `ADMIN_ONLY`** vào enum `target_type`
4. **Cập nhật logic** để xử lý trạng thái đọc dựa trên bảng `notification_reads`

## Cấu trúc Database mới

### Bảng notifications:
```sql
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    type ENUM('SYSTEM', 'PROMO') NOT NULL,
    target_type ENUM('ALL_USERS', 'OWNER_ONLY', 'USER_SPECIFIC', 'ADMIN_ONLY') NOT NULL,
    target_user_id BIGINT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng notification_reads:
```sql
CREATE TABLE notification_reads (
    notification_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id)
);
```

## Các file đã được cập nhật

### Backend:
1. **Entity:**
   - `Notification.java` - Loại bỏ cột `isRead`, thêm `ADMIN_ONLY`
   - `NotificationRead.java` - Entity mới cho bảng `notification_reads`
   - `NotificationReadId.java` - Composite key cho `NotificationRead`

2. **Repository:**
   - `NotificationRepository.java` - Cập nhật queries
   - `NotificationReadRepository.java` - Repository mới

3. **Service:**
   - `NotificationService.java` - Logic mới cho xử lý trạng thái đọc

4. **Controller:**
   - `NotificationController.java` - API endpoints mới
   - `NotificationWebSocketController.java` - WebSocket mới

### Frontend:
1. **Components:**
   - `NotificationBell.js` - Xử lý trạng thái đọc mới
   - `AdminNotificationManager.js` - Hỗ trợ `ADMIN_ONLY`
   - `NotificationList.js` - Cập nhật logic hiển thị

2. **API:**
   - `notification.js` - Không thay đổi (API endpoints giữ nguyên)

## Cách sử dụng

### 1. Tạo notification:
```java
// Cho tất cả user
notificationService.createNotificationForAllUsers("Nội dung", Notification.NotificationType.SYSTEM);

// Cho chủ xe
notificationService.createNotificationForOwners("Nội dung", Notification.NotificationType.SYSTEM);

// Cho user cụ thể
notificationService.createNotificationForSpecificUser("Nội dung", Notification.NotificationType.SYSTEM, userId);

// Cho admin
notificationService.createNotificationForAdmins("Nội dung", Notification.NotificationType.SYSTEM);
```

### 2. Đánh dấu đã đọc:
```java
// Đánh dấu một notification đã đọc
notificationService.markAsRead(notificationId, userId);

// Đánh dấu tất cả notification đã đọc
notificationService.markAllAsRead(userId);
```

### 3. Lấy thông báo:
```java
// Lấy tất cả notification cho user
List<Notification> notifications = notificationService.getNotificationsForUser(userId);

// Lấy notification chưa đọc
List<Notification> unreadNotifications = notificationService.getUnreadNotificationsForUser(userId);

// Đếm notification chưa đọc
Long unreadCount = notificationService.getUnreadNotificationCount(userId);
```

## Migration từ cấu trúc cũ

### Bước 1: Backup database
```bash
mysqldump -u username -p database_name > backup_before_migration.sql
```

### Bước 2: Chạy script migration
```sql
-- Tạo bảng notification_reads từ dữ liệu cũ (nếu có)
INSERT INTO notification_reads (notification_id, user_id, read_at)
SELECT n.notification_id, u.user_id, NOW()
FROM notifications n
CROSS JOIN users u
WHERE n.is_read = true;

-- Xóa cột is_read khỏi bảng notifications
ALTER TABLE notifications DROP COLUMN is_read;

-- Thêm ADMIN_ONLY vào enum target_type (nếu chưa có)
ALTER TABLE notifications MODIFY COLUMN target_type ENUM('ALL_USERS', 'OWNER_ONLY', 'USER_SPECIFIC', 'ADMIN_ONLY') NOT NULL;
```

### Bước 3: Deploy code mới
1. Deploy backend với các file đã cập nhật
2. Deploy frontend với các component đã cập nhật
3. Restart application

### Bước 4: Kiểm tra
1. Kiểm tra tạo notification mới
2. Kiểm tra đánh dấu đã đọc
3. Kiểm tra hiển thị notification trên frontend
4. Kiểm tra WebSocket real-time

## Lưu ý quan trọng

1. **Backup database** trước khi migration
2. **Test trên môi trường staging** trước khi deploy production
3. **Kiểm tra dữ liệu** sau khi migration
4. **Monitor logs** để đảm bảo không có lỗi
5. **Rollback plan** nếu có vấn đề

## Troubleshooting

### Lỗi thường gặp:
1. **Foreign key constraint**: Đảm bảo bảng `notification_reads` được tạo trước khi xóa cột `is_read`
2. **Enum value**: Đảm bảo `ADMIN_ONLY` đã được thêm vào enum
3. **Frontend cache**: Clear cache browser sau khi deploy

### Kiểm tra migration:
```sql
-- Kiểm tra cấu trúc bảng
DESCRIBE notifications;
DESCRIBE notification_reads;

-- Kiểm tra dữ liệu
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM notification_reads;

-- Kiểm tra enum values
SHOW COLUMNS FROM notifications LIKE 'target_type';
``` 