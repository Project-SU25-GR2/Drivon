# Online Status System Guide

## Tổng quan

Hệ thống online status được implement với các tính năng sau:

1. **Frontend định kỳ báo hiệu "tôi đang online" (heartbeat)** mỗi 20 giây **CHỈ KHI Ở MESSAGES PAGE**
2. **Backend lưu trạng thái online** với timeout 30 giây
3. **API kiểm tra trạng thái đối phương**
4. **Tối ưu polling** khi người kia offline (giảm từ 3s xuống 30s)
5. **Tự động offline** khi chuyển sang page khác

## ⚠️ Lưu ý quan trọng

**Heartbeat chỉ hoạt động khi user đang ở Messages page:**
- ✅ **Vào Messages page** → Start heartbeat → User online
- ❌ **Chuyển sang page khác** → Stop heartbeat → User offline ngay lập tức
- ✅ **Quay lại Messages page** → Start heartbeat lại → User online

## Cấu trúc Database

### Bảng `user_online_status`

```sql
CREATE TABLE user_online_status (
    user_id BIGINT PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## Backend Components

### 1. Entity: `UserOnlineStatus.java`
- Quản lý trạng thái online của user
- Tự động cập nhật timestamps

### 2. Repository: `UserOnlineStatusRepository.java`
- Các query để quản lý online status
- Tối ưu với indexes

### 3. Service: `UserOnlineStatusService.java`
- **updateHeartbeat()**: Cập nhật heartbeat cho user
- **markUserOffline()**: Đánh dấu user offline
- **isUserOnline()**: Kiểm tra user có online không
- **cleanupOfflineUsers()**: Scheduled task cleanup users offline
- **Cache system**: Tối ưu performance

### 4. Controller: `UserOnlineStatusController.java`
- `POST /api/online-status/heartbeat`: Frontend gọi định kỳ
- `GET /api/online-status/user/{userId}`: Kiểm tra trạng thái user
- `POST /api/online-status/users`: Kiểm tra nhiều user
- `GET /api/online-status/online-users`: Lấy danh sách user online
- `POST /api/online-status/offline`: Đánh dấu offline

## Frontend Components

### 1. Service: `OnlineStatusService.js`
- **startHeartbeat(userId)**: Bắt đầu heartbeat
- **stopHeartbeat()**: Dừng heartbeat
- **checkUserOnlineStatus(userId)**: Kiểm tra trạng thái user
- **checkUsersOnlineStatus(userIds)**: Kiểm tra nhiều user
- **Cache system**: Giảm API calls
- **Tab visibility handling**: Tối ưu khi tab không active

### 2. Component: `Messages.js` (Updated)
- Tích hợp online status checking
- **Tối ưu polling dựa trên online status**
- Hiển thị online/offline indicators
- **Polling behavior:**
  - **User online**: Polling 3 giây
  - **User offline**: **Dừng polling hoàn toàn** (tiết kiệm 100% tài nguyên)
- **Auto-resume**: Tự động bắt đầu polling khi user online lại

## Cách sử dụng

### 1. Khởi tạo hệ thống

```javascript
// Heartbeat tự động start khi vào Messages page
// Không cần gọi thủ công
```

### 2. Messages Page Behavior

```javascript
// Khi vào Messages page
useEffect(() => {
  // Tự động start heartbeat
  onlineStatusService.startHeartbeat(currentUser.userId);
  
  return () => {
    // Tự động stop heartbeat khi rời khỏi page
    onlineStatusService.stopHeartbeat();
  };
}, []);
```

### 3. Kiểm tra trạng thái user

```javascript
// Kiểm tra một user
const isOnline = await onlineStatusService.checkUserOnlineStatus(userId);

// Kiểm tra nhiều user
const onlineStatus = await onlineStatusService.checkUsersOnlineStatus([userId1, userId2, userId3]);
```

### 4. API Endpoints

```bash
# Heartbeat
POST /api/online-status/heartbeat
{
  "userId": 123
}

# Kiểm tra user
GET /api/online-status/user/123

# Kiểm tra nhiều user
POST /api/online-status/users
{
  "userIds": [123, 456, 789]
}

# Lấy danh sách online
GET /api/online-status/online-users

# Đánh dấu offline
POST /api/online-status/offline
{
  "userId": 123
}
```

### 5. Test Component

Truy cập `/test-online-status` để test các tính năng:
- Start/Stop heartbeat
- Kiểm tra online users
- Test online status của user cụ thể

## Tối ưu Performance

### 1. Caching
- Backend: Cache online status trong memory
- Frontend: Cache online status để giảm API calls

### 2. Polling Optimization
- **User online**: Polling 3 giây
- **User offline**: **Dừng polling hoàn toàn** (tiết kiệm 100% tài nguyên)
- **Auto-resume**: Tự động bắt đầu polling khi user online lại
- **Periodic status check**: Kiểm tra online status mỗi 10 giây

### 3. Scheduled Cleanup
- Backend tự động cleanup users offline sau 30 giây
- Chạy mỗi phút để tối ưu database

## Timeout Configuration

- **Heartbeat interval**: 20 giây (frontend)
- **Online timeout**: 30 giây (backend)
- **Cleanup interval**: 60 giây (backend)
- **Status check interval**: 30 giây (frontend)

## Monitoring

### Backend Logs
```
Heartbeat updated for user: 123
User 456 marked as offline
Cleanup: 3 users marked offline
```

### Frontend Console
```
Heartbeat sent successfully
Selected user John online status: true
Conversations online status updated: {123: true, 456: false}
```

## Troubleshooting

### 1. User không hiển thị online
- Kiểm tra heartbeat có đang chạy không
- Kiểm tra network connection
- Kiểm tra backend logs

### 2. Polling không tối ưu
- Kiểm tra online status API
- Kiểm tra cache có hoạt động không
- Kiểm tra console logs

### 3. Performance issues
- Kiểm tra database indexes
- Kiểm tra cache size
- Monitor API response times

## Security Considerations

1. **Authentication**: Tất cả API endpoints cần authentication
2. **Rate limiting**: Giới hạn heartbeat requests
3. **Input validation**: Validate user IDs
4. **SQL injection**: Sử dụng prepared statements

## Future Enhancements

1. **WebSocket integration**: Real-time online status updates
2. **Presence indicators**: "Typing...", "Last seen"
3. **Status messages**: "Away", "Busy", "Do not disturb"
4. **Mobile optimization**: Battery-aware heartbeat
5. **Analytics**: Online time tracking, usage patterns 