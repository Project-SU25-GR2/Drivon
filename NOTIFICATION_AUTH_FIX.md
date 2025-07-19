# Hướng dẫn Fix Vấn đề Authentication trong Notification

## Vấn đề đã được giải quyết

### 1. Nguyên nhân gốc rễ
- **SecurityConfig** đã cấu hình `.permitAll()` cho tất cả requests nhưng **không có JWT filter**
- Điều này khiến Principal luôn null vì không có authentication filter nào xử lý JWT token
- Requests có Authorization header nhưng không được xử lý để tạo Principal

### 2. Giải pháp đã áp dụng

#### A. Tạo JWT Authentication Filter
**File:** `backend/src/main/java/Drivon/backend/config/JwtAuthenticationFilter.java`

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Xử lý JWT token từ Authorization header
    // Tạo Principal nếu token hợp lệ
    // Cho phép request đi qua ngay cả khi không có token
}
```

#### B. Tạo CustomUserDetailsService
**File:** `backend/src/main/java/Drivon/backend/service/CustomUserDetailsService.java`

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    // Load user details từ database theo email
    // Tạo UserDetails object với authorities
}
```

#### C. Cập nhật SecurityConfig
**File:** `backend/src/main/java/Drivon/backend/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
            .requestMatchers("/api/auth/**", "/api/contracts/**", "/api/**").permitAll()
            .requestMatchers("/ws/**", "/topic/**", "/user/**", "/app/**").permitAll()
            .anyRequest().permitAll()
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

#### D. Tạo Test Controller
**File:** `backend/src/main/java/Drivon/backend/controller/TestController.java`

```java
@RestController
@RequestMapping("/api/test")
public class TestController {
    @GetMapping("/auth")
    public ResponseEntity<?> testAuth(Principal principal) {
        // Test endpoint để kiểm tra authentication
    }
}
```

## Cách Test

### 1. Khởi động Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Test Authentication

#### A. Sử dụng Test Script
**File:** `test_notification_auth.js`

```javascript
// Copy nội dung file test_notification_auth.js vào browser console
// Hoặc chạy với Node.js

// Chạy tất cả tests
runAllTests();
```

#### B. Test thủ công với curl
```bash
# Test public endpoint (không cần token)
curl http://localhost:8080/api/test/public

# Test auth endpoint (cần token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/test/auth

# Test notifications endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications

# Test unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/unread-count
```

#### C. Test trong Browser Console
```javascript
// Lấy token từ localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);

// Test authentication
fetch('http://localhost:8080/api/test/auth', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => console.log('Auth result:', data));

// Test notifications
fetch('http://localhost:8080/api/notifications', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => console.log('Notifications:', data));
```

### 3. Kiểm tra Logs Backend

Trong console của backend, bạn sẽ thấy logs như:

```
=== TEST AUTH ENDPOINT ===
Principal: user@example.com
Principal class: org.springframework.security.authentication.UsernamePasswordAuthenticationToken
Authentication: user@example.com
Authentication class: org.springframework.security.authentication.UsernamePasswordAuthenticationToken
UserDetails username: user@example.com
UserDetails authorities: [ROLE_USER]
```

## Kết quả mong đợi

### 1. Khi có token hợp lệ:
```json
{
  "message": "Authentication successful",
  "email": "user@example.com",
  "authentication": "user@example.com"
}
```

### 2. Khi không có token hoặc token không hợp lệ:
```json
{
  "error": "User not authenticated",
  "message": "Principal is null",
  "authentication": "null"
}
```

### 3. Notifications API sẽ trả về:
```json
[
  {
    "notificationId": 1,
    "content": "Welcome to Drivon!",
    "type": "SYSTEM",
    "targetType": "ALL_USERS",
    "createdAt": "2024-01-01T10:00:00"
  }
]
```

## Troubleshooting

### 1. Nếu vẫn gặp lỗi "User not authenticated"

#### A. Kiểm tra token có tồn tại không:
```javascript
// Trong browser console
console.log('Token exists:', !!localStorage.getItem('token'));
console.log('Token value:', localStorage.getItem('token'));
```

#### B. Kiểm tra token có hợp lệ không:
```javascript
// Decode JWT token (chỉ để debug)
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expired:', new Date(payload.exp * 1000) < new Date());
}
```

#### C. Kiểm tra user có tồn tại trong database không:
```sql
-- Kiểm tra user theo email từ token
SELECT * FROM users WHERE email = 'user@example.com';
```

### 2. Nếu backend không start được

#### A. Kiểm tra dependencies:
```bash
cd backend
./mvnw clean compile
```

#### B. Kiểm tra logs lỗi:
```bash
./mvnw spring-boot:run
```

### 3. Nếu CORS errors

Kiểm tra SecurityConfig.java có đúng CORS configuration không:
```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
configuration.setAllowCredentials(true);
```

## Các file đã được tạo/sửa đổi

1. ✅ `backend/src/main/java/Drivon/backend/config/JwtAuthenticationFilter.java` - **MỚI**
2. ✅ `backend/src/main/java/Drivon/backend/service/CustomUserDetailsService.java` - **MỚI**
3. ✅ `backend/src/main/java/Drivon/backend/config/SecurityConfig.java` - **SỬA ĐỔI**
4. ✅ `backend/src/main/java/Drivon/backend/controller/TestController.java` - **SỬA ĐỔI**
5. ✅ `test_notification_auth.js` - **MỚI** (để test)
6. ✅ `NOTIFICATION_AUTH_FIX.md` - **MỚI** (hướng dẫn này)

## Lưu ý quan trọng

1. **Tất cả requests vẫn được permitAll()** - không có thay đổi về security policy
2. **JWT filter chỉ xử lý token nếu có** - không block requests không có token
3. **Principal sẽ được tạo tự động** nếu có token hợp lệ
4. **Backend logs sẽ hiển thị chi tiết** về authentication process

## Bước tiếp theo

1. Restart backend server
2. Test với script hoặc curl commands
3. Kiểm tra logs backend
4. Nếu vẫn có vấn đề, kiểm tra token và user database 