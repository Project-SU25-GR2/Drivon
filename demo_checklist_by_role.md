# CHECKLIST DEMO THEO VAI TRÒ - DRIVON

## TRƯỚC NGÀY THUYẾT TRÌNH

### 1. Chuẩn bị hệ thống (30 phút trước)
- [ ] **Backend Spring Boot:**
  - [ ] Chạy `mvn spring-boot:run` trong `backend/`
  - [ ] Kiểm tra `http://localhost:8080` hoạt động
  - [ ] Test database connection
  - [ ] Verify PayOS, Cloudinary config

- [ ] **Frontend React:**
  - [ ] Chạy `npm start` trong `frontend/`
  - [ ] Kiểm tra `http://localhost:3000` hoạt động
  - [ ] Test routing cho 3 roles
  - [ ] Verify WebSocket connection

- [ ] **Database:**
  - [ ] MySQL service đang chạy
  - [ ] Database `car_rental_system2` tồn tại
  - [ ] Có dữ liệu test cho 3 roles

### 2. Chuẩn bị tài khoản test theo role
```sql
-- Tạo tài khoản cho 3 roles
INSERT INTO users (email, phone, password, full_name, role, enabled) VALUES
('renter@test.com', '0123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Renter', 'renter', 1),
('owner@test.com', '0987654321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Owner', 'owner', 1),
('admin@test.com', '0555666777', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Admin', 'admin', 1);

-- Tạo xe cho owner
INSERT INTO cars (license_plate, owner_id, brand, model, year, seats, status, type, transmission, fuel_type, description, location) VALUES
('30A-12345', 2, 'Toyota', 'Vios', 2020, 5, 'available', 'Sedan', 'automatic', 'gasoline', 'Xe gia đình tiết kiệm nhiên liệu', 'Hà Nội'),
('30B-67890', 2, 'Honda', 'City', 2021, 5, 'available', 'Sedan', 'automatic', 'gasoline', 'Xe sang trọng, tiện nghi', 'Hà Nội'),
('30C-11111', 2, 'Ford', 'Ranger', 2019, 5, 'available', 'Pickup', 'manual', 'diesel', 'Xe bán tải mạnh mẽ', 'Hà Nội');
```

### 3. Test từng role riêng biệt
- [ ] **Renter Role Test:**
  - [ ] Login với `renter@test.com`
  - [ ] Tìm kiếm xe hoạt động
  - [ ] Đặt xe thành công
  - [ ] Thanh toán hoạt động

- [ ] **Owner Role Test:**
  - [ ] Login với `owner@test.com`
  - [ ] Quản lý xe hoạt động
  - [ ] Phê duyệt đặt xe
  - [ ] Xem thống kê doanh thu

- [ ] **Admin Role Test:**
  - [ ] Login với `admin@test.com`
  - [ ] Quản lý users
  - [ ] Xem analytics
  - [ ] Quản lý promotions

## NGÀY THUYẾT TRÌNH

### 1. Trước khi bắt đầu (15 phút)
- [ ] **Kiểm tra lại hệ thống:**
  - [ ] Backend chạy ổn định
  - [ ] Frontend load nhanh
  - [ ] Database connection ổn định
  - [ ] Test login với cả 3 tài khoản

- [ ] **Chuẩn bị trình duyệt:**
  - [ ] Mở sẵn `http://localhost:3000`
  - [ ] Clear cache nếu cần
  - [ ] Mở Developer Tools để debug
  - [ ] Chuẩn bị 3 tab cho 3 roles

### 2. Demo theo role workflow

#### ROLE 1: RENTER (4 phút)
- [ ] **Đăng nhập Renter:**
  - [ ] Mở trang chủ
  - [ ] Click "Đăng nhập"
  - [ ] Login với `renter@test.com`
  - [ ] Giải thích JWT authentication

- [ ] **Tìm kiếm xe:**
  - [ ] Vào trang "Thuê xe"
  - [ ] Demo filter options
  - [ ] Chọn xe Toyota Vios
  - [ ] Xem chi tiết xe

- [ ] **Đặt xe:**
  - [ ] Chọn ngày bắt đầu/kết thúc
  - [ ] Chọn địa điểm
  - [ ] Điền thông tin
  - [ ] Xác nhận đặt xe

#### ROLE 2: OWNER (4 phút)
- [ ] **Chuyển sang Owner:**
  - [ ] Logout khỏi Renter
  - [ ] Login với `owner@test.com`
  - [ ] Vào Owner Dashboard
  - [ ] Giải thích role transition

- [ ] **Quản lý xe:**
  - [ ] Vào "Quản lý xe"
  - [ ] Demo thêm xe mới
  - [ ] Upload ảnh xe
  - [ ] Chỉnh sửa thông tin

- [ ] **Quản lý đặt xe:**
  - [ ] Vào "Quản lý đặt xe"
  - [ ] Xem danh sách đặt xe
  - [ ] Demo phê duyệt/từ chối
  - [ ] Giải thích real-time notification

- [ ] **Thống kê doanh thu:**
  - [ ] Vào "Thống kê doanh thu"
  - [ ] Xem biểu đồ
  - [ ] Giải thích revenue tracking

#### ROLE 3: ADMIN (2 phút)
- [ ] **Chuyển sang Admin:**
  - [ ] Logout khỏi Owner
  - [ ] Login với `admin@test.com`
  - [ ] Vào Admin Dashboard
  - [ ] Giải thích admin privileges

- [ ] **Quản lý người dùng:**
  - [ ] Vào "Quản lý người dùng"
  - [ ] Xem danh sách users
  - [ ] Demo thay đổi role
  - [ ] Giải thích role-based access

- [ ] **Thống kê tổng quan:**
  - [ ] Vào "Dashboard tổng quan"
  - [ ] Xem analytics
  - [ ] Giải thích system overview

### 3. Tính năng chung (3 phút)
- [ ] **Real-time Features:**
  - [ ] Demo WebSocket chat
  - [ ] Show real-time notifications
  - [ ] Explain live booking status

- [ ] **Payment Integration:**
  - [ ] Demo PayOS QR code
  - [ ] Show payment methods
  - [ ] Explain webhook handling

- [ ] **Security Features:**
  - [ ] Explain JWT authentication
  - [ ] Show role-based access
  - [ ] Demo document verification

## DEMO SCRIPT THEO ROLE

### Opening Script:
*"Chào các bạn, hôm nay chúng tôi sẽ giới thiệu Drivon - một nền tảng thuê xe với 3 vai trò người dùng chính: Renter (người thuê), Owner (chủ xe), và Admin (quản trị viên)."*

### Role Transition Scripts:
- **Renter → Owner:** *"Bây giờ chúng ta sẽ chuyển sang góc độ của chủ xe - những người cung cấp xe cho thuê."*
- **Owner → Admin:** *"Cuối cùng, chúng ta sẽ xem vai trò quản trị viên - người quản lý toàn bộ hệ thống."*

### Feature Explanation Scripts:
- **Renter Features:** *"Renter có thể tìm kiếm xe, đặt xe, thanh toán và đánh giá."*
- **Owner Features:** *"Owner có thể quản lý xe, phê duyệt đặt xe và xem thống kê doanh thu."*
- **Admin Features:** *"Admin có thể quản lý toàn bộ hệ thống, phân tích dữ liệu và quản lý người dùng."*

## BACKUP PLAN THEO ROLE

### Nếu có lỗi với một role:
1. **Bình tĩnh** và giải thích lỗi
2. **Chuyển sang role khác** nếu cần
3. **Sử dụng screenshots** cho role bị lỗi
4. **Tập trung vào tính năng hoạt động**

### Key Points cho từng role:
- **Renter:** Tìm kiếm, đặt xe, thanh toán
- **Owner:** Quản lý xe, phê duyệt, thống kê
- **Admin:** Quản lý hệ thống, phân tích

## CÂU HỎI THEO ROLE

### Renter Questions:
- "Làm sao để tìm xe phù hợp?"
- "Quy trình đặt xe như thế nào?"
- "Thanh toán có an toàn không?"

### Owner Questions:
- "Làm sao để thêm xe mới?"
- "Có thể quản lý nhiều xe không?"
- "Thống kê doanh thu chi tiết như thế nào?"

### Admin Questions:
- "Có thể quản lý bao nhiêu users?"
- "Hệ thống có thể scale không?"
- "Bảo mật như thế nào?"

## TIPS CUỐI CÙNG

1. **Tập trung vào role transition** mượt mà
2. **Giải thích business value** của từng role
3. **Kết nối giữa các vai trò** khi demo
4. **Chuẩn bị backup plan** cho mỗi role
5. **Tự tin và bình tĩnh** khi có lỗi

**CHÚC BẠN THUYẾT TRÌNH THÀNH CÔNG! 🚀** 