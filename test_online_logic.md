# Test Online Status Logic

## Logic đã sửa:

**Đơn giản: Nếu `last_heartbeat` > 30 giây trước thì user offline**

```java
// Trong UserOnlineStatusService.java
LocalDateTime cutoffTime = LocalDateTime.now().minusSeconds(30);
boolean isOnline = userStatus.getLastHeartbeat().isAfter(cutoffTime);
```

## Cách test:

### 1. Start backend và frontend
```bash
# Terminal 1
cd backend
mvn spring-boot:run

# Terminal 2  
cd frontend
npm start
```

### 2. Test với 2 user khác nhau
1. **Browser 1**: Login user A
2. **Browser 2**: Login user B
3. **Vào `/test-online-status`** ở cả 2 browser

### 3. Test heartbeat
1. **Bấm "Start Heartbeat"** ở cả 2 browser
2. **Bấm "Debug Status"** để xem records
3. **Bấm "Get Online Users"** để xem danh sách online

### 4. Test offline detection
1. **Đóng 1 browser** (giả sử user B)
2. **Đợi 30 giây**
3. **Ở browser còn lại, bấm "Force Cleanup"**
4. **Bấm "Debug Status"** để xem user B đã offline chưa
5. **Bấm "Get Online Users"** để xem danh sách online

### 5. Kiểm tra debug info
Debug info sẽ hiển thị:
```json
{
  "userId": 123,
  "isOnlineInDB": true,        // Trạng thái trong DB
  "actualOnlineStatus": false, // Trạng thái thực tế (dựa trên last_heartbeat)
  "secondsSinceHeartbeat": 45, // Số giây từ lần heartbeat cuối
  "shouldBeOffline": true,     // Có nên offline không
  "statusMismatch": true       // DB có khác với thực tế không
}
```

## Kết quả mong đợi:

- **User đang online**: `last_heartbeat` < 30 giây trước
- **User offline**: `last_heartbeat` > 30 giây trước
- **Force Cleanup**: Cập nhật `is_online` trong DB theo `last_heartbeat`

## Troubleshooting:

1. **User vẫn hiển thị online**: Bấm "Force Cleanup" để sync DB
2. **Cache không update**: Bấm "Debug Status" để xem thực tế
3. **Logic sai**: Kiểm tra `secondsSinceHeartbeat` và `actualOnlineStatus` 