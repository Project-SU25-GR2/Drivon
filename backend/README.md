# Backend Configuration Guide

## Database Configuration

1. Copy file `application.properties.example` thành `application.properties`:
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

2. Cập nhật các thông tin trong `application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://your_host:3306/car_rental_system?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Trong đó:
- `your_host`: Địa chỉ IP hoặc hostname của MySQL server
- `your_username`: Tên đăng nhập MySQL
- `your_password`: Mật khẩu MySQL

## JWT Configuration

Cập nhật thông tin JWT trong `application.properties`:

```properties
jwt.secret=your-secret-key
jwt.expiration=86400000  # Thời gian hết hạn token (ms)
```

## Các cấu hình khác

- `spring.jpa.hibernate.ddl-auto=update`: Tự động cập nhật schema database
- `spring.jpa.show-sql=true`: Hiển thị các câu lệnh SQL
- `server.port=8080`: Cổng chạy ứng dụng

## Lưu ý

- Không commit file `application.properties` lên git
- Luôn sử dụng file `application.properties.example` làm mẫu
- Bảo mật thông tin nhạy cảm trong `application.properties` 