# Hệ Thống Thông Báo (Notification System)

## Tổng Quan
Hệ thống thông báo trong Drivon cho phép admin gửi thông báo đến người dùng thông qua WebSocket real-time và lưu trữ trong database.

## Cấu Trúc Database

### Bảng `notifications`
```sql
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL COMMENT 'Nội dung thông báo',
    type ENUM('SYSTEM', 'PROMO') NOT NULL DEFAULT 'SYSTEM',
    target_type ENUM('ALL_USERS', 'OWNER_ONLY', 'USER_SPECIFIC') NOT NULL DEFAULT 'ALL_USERS',
    target_user_id BIGINT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id)
);
```

### Các Trường Dữ Liệu

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `notification_id` | BIGINT | ID duy nhất của thông báo |
| `content` | TEXT | Nội dung thông báo |
| `type` | ENUM | Loại thông báo: SYSTEM (hệ thống), PROMO (khuyến mãi) |
| `target_type` | ENUM | Đối tượng nhận: ALL_USERS, OWNER_ONLY, USER_SPECIFIC |
| `target_user_id` | BIGINT | ID user cụ thể (chỉ dùng khi target_type = USER_SPECIFIC) |
| `is_read` | BOOLEAN | Trạng thái đã đọc |
| `created_at` | DATETIME | Thời gian tạo thông báo |

## Các Loại Thông Báo

### 1. SYSTEM (Thông báo hệ thống)
- Thông báo bảo trì
- Cập nhật chính sách
- Thông báo quan trọng từ admin

### 2. PROMO (Thông báo khuyến mãi)
- Khuyến mãi giảm giá
- Ưu đãi đặc biệt
- Chương trình khuyến mãi

## Đối Tượng Nhận Thông Báo

### 1. ALL_USERS (Tất cả người dùng)
- Thông báo chung cho toàn bộ hệ thống
- Ví dụ: "Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng"

### 2. OWNER_ONLY (Chỉ chủ xe)
- Thông báo dành riêng cho chủ xe
- Ví dụ: "Cập nhật chính sách bảo hiểm xe mới"

### 3. USER_SPECIFIC (Người dùng cụ thể)
- Thông báo gửi đến một user cụ thể
- Cần có `target_user_id`

## API Endpoints

### Admin Endpoints
```
POST /api/notifications - Tạo thông báo mới
GET /api/notifications/admin/all - Lấy tất cả thông báo
PUT /api/notifications/{id} - Cập nhật thông báo
DELETE /api/notifications/{id} - Xóa thông báo
```

### User Endpoints
```
GET /api/notifications - Lấy thông báo của user
GET /api/notifications/unread-count - Đếm thông báo chưa đọc
PUT /api/notifications/{id}/read - Đánh dấu đã đọc
PUT /api/notifications/mark-all-read - Đánh dấu tất cả đã đọc
```

## WebSocket Events

### Gửi thông báo
```javascript
// Gửi thông báo cá nhân
stompClient.publish({
    destination: '/app/notification.send',
    body: JSON.stringify(notificationData)
});
```

### Nhận thông báo
```javascript
// Đăng ký nhận thông báo cá nhân
stompClient.subscribe('/user/notifications/new', callback);

// Đăng ký nhận thông báo broadcast
stompClient.subscribe('/notifications/broadcast', callback);
```

## Frontend Components

### 1. NotificationBell.js
- Hiển thị icon chuông thông báo
- Hiển thị số thông báo chưa đọc
- Mở dropdown danh sách thông báo

### 2. NotificationList.js
- Hiển thị danh sách thông báo
- Cho phép đánh dấu đã đọc
- Phân loại thông báo đã đọc/chưa đọc

### 3. AdminNotificationManager.js
- Giao diện admin tạo thông báo
- Quản lý thông báo (CRUD)
- Chọn đối tượng nhận thông báo

## Luồng Hoạt Động

### 1. Admin tạo thông báo
1. Admin nhập nội dung và chọn loại thông báo
2. Chọn đối tượng nhận (ALL_USERS, OWNER_ONLY, USER_SPECIFIC)
3. Hệ thống lưu vào database
4. Gửi thông báo qua WebSocket

### 2. User nhận thông báo
1. WebSocket nhận thông báo real-time
2. Cập nhật UI (icon chuông, số thông báo)
3. Hiển thị trong dropdown khi click

### 3. User đánh dấu đã đọc
1. User click "Đánh dấu đã đọc"
2. Gọi API cập nhật trạng thái
3. Cập nhật UI và số thông báo

## Database Views và Stored Procedures

### Views
- `user_notifications`: View hiển thị thông báo với thông tin user
- `notification_stats`: Thống kê thông báo theo loại và ngày

### Stored Procedures
- `CreateNotification()`: Tạo thông báo mới
- `MarkNotificationAsRead()`: Đánh dấu đã đọc
- `GetUnreadCountForUser()`: Đếm thông báo chưa đọc

## Bảo Mật

### Authorization
- Chỉ admin có quyền tạo, sửa, xóa thông báo
- User chỉ có thể xem và đánh dấu đã đọc thông báo của mình

### Validation
- Kiểm tra nội dung không được rỗng
- Kiểm tra target_user_id khi target_type = USER_SPECIFIC
- Validate enum values cho type và target_type

## Performance Optimization

### Indexes
- `idx_target_type`: Tối ưu truy vấn theo loại đối tượng
- `idx_target_user`: Tối ưu truy vấn theo user cụ thể
- `idx_is_read`: Tối ưu đếm thông báo chưa đọc
- `idx_created_at`: Tối ưu sắp xếp theo thời gian

### Caching
- Cache số thông báo chưa đọc
- Cache danh sách thông báo gần đây

## Monitoring và Logging

### Logs
- Log khi tạo thông báo mới
- Log khi user đánh dấu đã đọc
- Log lỗi WebSocket connection

### Metrics
- Số thông báo được tạo mỗi ngày
- Tỷ lệ thông báo được đọc
- Thời gian phản hồi của WebSocket 