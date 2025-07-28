# CHECKLIST CHUẨN BỊ DEMO DRIVON

## TRƯỚC NGÀY THUYẾT TRÌNH

### 1. Kiểm tra hệ thống (30 phút trước)
- [ ] **Backend Spring Boot:**
  - [ ] Chạy `mvn spring-boot:run` trong thư mục `backend/`
  - [ ] Kiểm tra `http://localhost:8080` hoạt động
  - [ ] Kiểm tra database connection
  - [ ] Test các API endpoints chính

- [ ] **Frontend React:**
  - [ ] Chạy `npm start` trong thư mục `frontend/`
  - [ ] Kiểm tra `http://localhost:3000` hoạt động
  - [ ] Test login/logout functionality
  - [ ] Kiểm tra routing hoạt động

- [ ] **Database:**
  - [ ] MySQL service đang chạy
  - [ ] Database `car_rental_system2` tồn tại
  - [ ] Có dữ liệu test sẵn sàng

### 2. Chuẩn bị dữ liệu test
```sql
-- Tạo tài khoản demo
INSERT INTO users (email, phone, password, full_name, role, enabled) VALUES
('demo@test.com', '0123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'renter', 1),
('owner@test.com', '0987654321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Owner', 'owner', 1),
('admin@test.com', '0555666777', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Admin', 'admin', 1);

-- Tạo xe demo
INSERT INTO cars (license_plate, owner_id, brand, model, year, seats, status, type, transmission, fuel_type, description, location) VALUES
('30A-12345', 2, 'Toyota', 'Vios', 2020, 5, 'available', 'Sedan', 'automatic', 'gasoline', 'Xe gia đình tiết kiệm nhiên liệu', 'Hà Nội'),
('30B-67890', 2, 'Honda', 'City', 2021, 5, 'available', 'Sedan', 'automatic', 'gasoline', 'Xe sang trọng, tiện nghi', 'Hà Nội'),
('30C-11111', 2, 'Ford', 'Ranger', 2019, 5, 'available', 'Pickup', 'manual', 'diesel', 'Xe bán tải mạnh mẽ', 'Hà Nội');

-- Tạo khuyến mãi demo
INSERT INTO promotions (code, discount_percent, valid_until, max_uses) VALUES
('WELCOME10', 10, DATE_ADD(NOW(), INTERVAL 30 DAY), 100),
('SUMMER20', 20, DATE_ADD(NOW(), INTERVAL 60 DAY), 50);
```

### 3. Kiểm tra external services
- [ ] **PayOS Configuration:**
  - [ ] API keys đúng trong `PayOSConfig.java`
  - [ ] Test tạo QR code thanh toán
  - [ ] Webhook endpoint hoạt động

- [ ] **Cloudinary Configuration:**
  - [ ] API keys đúng trong `cloudinary.js`
  - [ ] Test upload ảnh
  - [ ] Ảnh hiển thị đúng

- [ ] **Email Service:**
  - [ ] SMTP configuration đúng
  - [ ] Test gửi email
  - [ ] Email templates hoạt động

### 4. Chuẩn bị backup
- [ ] **Screenshots:** Chụp màn hình các trang chính
- [ ] **Video demo:** Quay video demo dự phòng
- [ ] **Slides:** Chuẩn bị PowerPoint với screenshots
- [ ] **Code snippets:** Chuẩn bị code quan trọng để giải thích

## NGÀY THUYẾT TRÌNH

### 1. Trước khi bắt đầu (15 phút)
- [ ] **Kiểm tra lại hệ thống:**
  - [ ] Backend chạy ổn định
  - [ ] Frontend load nhanh
  - [ ] Database connection ổn định
  - [ ] Test login với tài khoản demo

- [ ] **Chuẩn bị trình duyệt:**
  - [ ] Mở sẵn `http://localhost:3000`
  - [ ] Clear cache nếu cần
  - [ ] Mở Developer Tools để debug nếu cần

### 2. Trong khi demo
- [ ] **Nói chậm và rõ ràng**
- [ ] **Giải thích từng bước**
- [ ] **Tập trung vào business logic**
- [ ] **Sẵn sàng trả lời câu hỏi**

### 3. Nếu có lỗi
- [ ] **Bình tĩnh và giải thích lỗi**
- [ ] **Chuyển sang backup plan**
- [ ] **Sử dụng screenshots nếu cần**
- [ ] **Tập trung vào tính năng hoạt động**

## DEMO WORKFLOW CHI TIẾT

### Bước 1: Đăng nhập (1 phút)
```
1. Mở http://localhost:3000
2. Click "Đăng nhập"
3. Đăng nhập với: demo@test.com / password
4. Giải thích: "Hệ thống sử dụng JWT authentication"
```

### Bước 2: Tìm kiếm xe (2 phút)
```
1. Vào trang "Thuê xe"
2. Giải thích filter options
3. Chọn một xe để xem chi tiết
4. Giải thích thông tin xe
```

### Bước 3: Đặt xe (2 phút)
```
1. Chọn ngày bắt đầu và kết thúc
2. Chọn địa điểm
3. Điền thông tin
4. Giải thích tính toán giá
```

### Bước 4: Thanh toán (2 phút)
```
1. Chọn phương thức thanh toán
2. Giải thích QR code
3. Demo webhook (nếu có thể)
4. Giải thích payment flow
```

### Bước 5: Owner Dashboard (2 phút)
```
1. Đăng nhập owner@test.com
2. Vào /owner
3. Demo quản lý xe
4. Demo thống kê
```

### Bước 6: Admin Dashboard (1 phút)
```
1. Đăng nhập admin@test.com
2. Vào /adminSecret
3. Demo quản lý user
4. Demo thống kê tổng quan
```

## CÂU HỎI THƯỜNG GẶP

### Technical Questions:
**Q: "Hệ thống sử dụng công nghệ gì?"**
A: "Frontend React, Backend Spring Boot, Database MySQL, Real-time WebSocket"

**Q: "Bảo mật như thế nào?"**
A: "JWT authentication, Role-based access control, Spring Security"

**Q: "Thanh toán tích hợp gì?"**
A: "PayOS QR code, Bank transfer, Cash payment với webhook real-time"

### Business Questions:
**Q: "Lợi ích của hệ thống?"**
A: "Kết nối chủ xe và người thuê, quản lý tự động, thanh toán đa dạng"

**Q: "Có thể mở rộng không?"**
A: "Có, kiến trúc modular, dễ thêm tính năng mới"

## TIPS CUỐI CÙNG

1. **Tập trung vào demo** thay vì code
2. **Giải thích business value** thay vì technical details
3. **Chuẩn bị backup plan** cho mọi tình huống
4. **Tự tin và bình tĩnh** khi có lỗi
5. **Tương tác với audience** khi có thể

**CHÚC BẠN THUYẾT TRÌNH THÀNH CÔNG! 🚀** 