# Hướng dẫn Debug Vấn đề Notification

## Vấn đề hiện tại
- Lỗi 400 Bad Request khi gọi API notifications
- Principal là null hoặc userId không tìm thấy

## Các bước debug

### 1. Kiểm tra Authentication
Truy cập `/test-notification` để kiểm tra:
- Token có tồn tại không
- User data có tồn tại không
- Authentication có hoạt động không

### 2. Kiểm tra Database
```sql
-- Kiểm tra bảng users
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Kiểm tra bảng notifications
SELECT * FROM notifications;

-- Kiểm tra bảng notification_reads
SELECT * FROM notification_reads;
```

### 3. Kiểm tra JWT Token
```javascript
// Trong browser console
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode token (nếu cần)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
```

### 4. Kiểm tra Backend Logs
Xem logs trong console của backend để tìm:
- Principal value
- User ID lookup
- Database errors

### 5. Các nguyên nhân có thể

#### A. User chưa đăng nhập
- Kiểm tra localStorage có token không
- Kiểm tra user đã login thành công chưa

#### B. Token hết hạn
- Token JWT có thể đã hết hạn
- Cần login lại

#### C. User không tồn tại trong database
- Email trong token không khớp với database
- User bị xóa khỏi database

#### D. CORS issues
- Kiểm tra CORS configuration
- Kiểm tra preflight requests

### 6. Cách khắc phục

#### A. Nếu user chưa đăng nhập
```javascript
// Redirect to login
window.location.href = '/login';
```

#### B. Nếu token hết hạn
```javascript
// Clear localStorage và redirect
localStorage.clear();
window.location.href = '/login';
```

#### C. Nếu user không tồn tại
- Kiểm tra database
- Tạo user mới hoặc khôi phục user

#### D. Nếu CORS issues
Kiểm tra SecurityConfig.java:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 7. Test Cases

#### Test 1: Kiểm tra authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/test-auth
```

#### Test 2: Kiểm tra get notifications
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications
```

#### Test 3: Kiểm tra unread count
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/unread-count
```

### 8. Logs cần kiểm tra

#### Backend logs:
```
=== TEST AUTH ===
Principal: user@example.com
Principal class: org.springframework.security.authentication.UsernamePasswordAuthenticationToken
User ID from email: 123
```

#### Frontend logs:
```
Auth header: {Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9..."}
Auth test response: {message: "Authentication successful", email: "user@example.com", userId: 123}
```

### 9. Các file cần kiểm tra

1. **SecurityConfig.java** - CORS và JWT configuration
2. **JwtTokenProvider.java** - Token validation
3. **UserRepository.java** - findByEmail method
4. **NotificationController.java** - Authentication handling
5. **Frontend localStorage** - Token storage

### 10. Quick Fix

Nếu vấn đề là authentication, thử:

1. **Clear browser data**:
   - Clear localStorage
   - Clear cookies
   - Hard refresh (Ctrl+F5)

2. **Login lại**:
   - Logout
   - Login với tài khoản hợp lệ

3. **Kiểm tra database**:
   - Đảm bảo user tồn tại
   - Đảm bảo email khớp với token

4. **Restart backend**:
   - Restart Spring Boot application
   - Kiểm tra logs startup

### 11. Monitoring

Sau khi fix, monitor:
- API response times
- Error rates
- User authentication success rate
- Database connection health 