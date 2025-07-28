# SCRIPT DEMO THEO VAI TRÒ - DRIVON

## PHẦN 1: GIỚI THIỆU (2 phút)

### Slide 1: Tổng quan dự án
**"Chào các bạn, hôm nay nhóm chúng tôi sẽ giới thiệu về dự án Drivon - một nền tảng thuê xe ô tô với 3 vai trò người dùng chính."**

**Điểm nổi bật:**
- ✅ 3 vai trò: Renter (Người thuê), Owner (Chủ xe), Admin (Quản trị)
- ✅ Hệ thống thuê xe end-to-end
- ✅ Tích hợp thanh toán đa dạng
- ✅ Real-time communication
- ✅ Bảo mật cao với JWT

---

## PHẦN 2: DEMO THEO VAI TRÒ (10-12 phút)

### ROLE 1: RENTER - NGƯỜI THUÊ XE (4 phút)

**"Đầu tiên, chúng ta sẽ xem trải nghiệm của người thuê xe - vai trò chính của hệ thống."**

#### Bước 1: Đăng ký/Đăng nhập (1 phút)
**Demo:**
1. Mở trang chủ `http://localhost:3000`
2. Click "Đăng nhập" → Chọn "Đăng ký"
3. Điền thông tin: Email, Phone, Password
4. Hoặc đăng nhập bằng Google OAuth
5. **"Hệ thống sử dụng JWT để bảo mật và Google OAuth để tiện lợi."**

#### Bước 2: Tìm kiếm và đặt xe (2 phút)
**Demo:**
1. Vào trang "Thuê xe" (`/rent-car`)
2. **"Renter có thể:"**
   - Tìm kiếm xe theo brand, model, location
   - Filter theo giá, số chỗ ngồi, loại xe
   - Sort theo rating, giá, ngày
3. Click vào xe Toyota Vios để xem chi tiết
4. **"Mỗi xe có thông tin đầy đủ: ảnh, mô tả, đánh giá, lịch sử thuê."**

#### Bước 3: Quy trình đặt xe (1 phút)
**Demo:**
1. Chọn ngày bắt đầu và kết thúc
2. Chọn địa điểm nhận và trả xe
3. **"Hệ thống tự động tính toán giá tiền dựa trên thời gian và loại xe."**
4. Điền thông tin cá nhân và xác nhận đặt xe

### ROLE 2: OWNER - CHỦ XE (4 phút)

**"Tiếp theo, chúng ta sẽ xem góc độ của chủ xe - những người cung cấp xe cho thuê."**

#### Bước 1: Đăng nhập Owner (30 giây)
**Demo:**
1. Đăng nhập với tài khoản Owner: `owner@test.com`
2. **"Owner có dashboard riêng để quản lý xe và đặt xe."**

#### Bước 2: Quản lý xe (2 phút)
**Demo:**
1. Vào "Quản lý xe" trong Owner Dashboard
2. **"Owner có thể:"**
   - Thêm xe mới với upload ảnh (Cloudinary)
   - Chỉnh sửa thông tin xe
   - Xem danh sách xe đang quản lý
   - Cập nhật trạng thái xe (available/unavailable)
3. **"Hệ thống hỗ trợ upload nhiều ảnh cho mỗi xe."**

#### Bước 3: Quản lý đặt xe (1 phút)
**Demo:**
1. Vào "Quản lý đặt xe"
2. **"Owner có thể:"**
   - Xem danh sách đặt xe mới
   - Phê duyệt hoặc từ chối đặt xe
   - Xem lịch sử đặt xe
   - Quản lý trạng thái đặt xe
3. **"Hệ thống thông báo real-time khi có đặt xe mới."**

#### Bước 4: Thống kê doanh thu (30 giây)
**Demo:**
1. Vào "Thống kê doanh thu"
2. **"Owner có thể xem:"**
   - Tổng doanh thu theo tháng/năm
   - Số lượng đặt xe thành công
   - Biểu đồ thống kê trực quan
   - Lịch sử giao dịch

### ROLE 3: ADMIN - QUẢN TRỊ VIÊN (2 phút)

**"Cuối cùng, chúng ta sẽ xem vai trò quản trị viên - người quản lý toàn bộ hệ thống."**

#### Bước 1: Đăng nhập Admin (30 giây)
**Demo:**
1. Đăng nhập với tài khoản Admin: `admin@test.com`
2. Vào Admin Dashboard (`/adminSecret`)
3. **"Admin có quyền truy cập tất cả tính năng hệ thống."**

#### Bước 2: Quản lý người dùng (1 phút)
**Demo:**
1. Vào "Quản lý người dùng"
2. **"Admin có thể:"**
   - Xem danh sách tất cả users
   - Thay đổi role (renter/owner/admin)
   - Kích hoạt/vô hiệu hóa tài khoản
   - Xem thống kê người dùng
3. **"Hệ thống phân quyền chi tiết cho từng vai trò."**

#### Bước 3: Thống kê tổng quan (30 giây)
**Demo:**
1. Vào "Dashboard tổng quan"
2. **"Admin có thể xem:"**
   - Tổng số người dùng, xe, đặt xe
   - Biểu đồ thống kê theo thời gian
   - Top xe được thuê nhiều nhất
   - Doanh thu tổng hệ thống

---

## PHẦN 3: TÍNH NĂNG CHUNG (3 phút)

### Tính năng Real-time
**"Cả 3 vai trò đều được hưởng lợi từ tính năng real-time:"**

1. **WebSocket Chat:** "Người dùng có thể chat trực tiếp"
2. **Real-time Notifications:** "Thông báo tức thì khi có cập nhật"
3. **Live Booking Status:** "Trạng thái đặt xe cập nhật real-time"

### Hệ thống Thanh toán
**"Tích hợp thanh toán đa dạng cho tất cả vai trò:"**

1. **PayOS Integration:** "QR code thanh toán"
2. **Bank Transfer:** "Chuyển khoản trực tiếp"
3. **Cash Payment:** "Thanh toán tiền mặt"
4. **Webhook Handling:** "Cập nhật trạng thái tự động"

### Bảo mật và Xác thực
**"Bảo mật đa lớp cho tất cả vai trò:"**

1. **JWT Authentication:** "Token-based security"
2. **Role-based Access:** "Phân quyền chi tiết"
3. **Document Verification:** "Xác thực tài liệu"

---

## PHẦN 4: KIẾN TRÚC KỸ THUẬT (2 phút)

### Slide: System Architecture
```
Frontend (React) ←→ Backend (Spring Boot) ←→ MySQL Database
                    ↓
              External Services
```

**"Backend sử dụng Spring Boot với 20+ controllers, services, repositories"**

### Slide: Role-based Architecture
**"Hệ thống được thiết kế theo vai trò:"**
- **Renter APIs:** Booking, Payment, Review
- **Owner APIs:** Car Management, Booking Approval, Revenue
- **Admin APIs:** User Management, System Analytics, Promotions

---

## PHẦN 5: KẾT LUẬN (1 phút)

**"Drivon là một hệ thống thuê xe hoàn chỉnh với 3 vai trò người dùng:"**

- ✅ **Renter:** Tìm kiếm, đặt xe, thanh toán, đánh giá
- ✅ **Owner:** Quản lý xe, phê duyệt đặt xe, thống kê doanh thu
- ✅ **Admin:** Quản lý toàn bộ hệ thống, phân tích dữ liệu

**"Mỗi vai trò có trải nghiệm riêng nhưng đều được kết nối thông qua real-time features và payment integration."**

**"Cảm ơn các bạn đã lắng nghe. Xin mời câu hỏi!"**

---

## CHUẨN BỊ DỮ LIỆU THEO ROLE

### Test Accounts:
```sql
-- Renter account
INSERT INTO users (email, phone, password, full_name, role, enabled) VALUES
('renter@test.com', '0123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Renter', 'renter', 1);

-- Owner account
INSERT INTO users (email, phone, password, full_name, role, enabled) VALUES
('owner@test.com', '0987654321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Owner', 'owner', 1);

-- Admin account
INSERT INTO users (email, phone, password, full_name, role, enabled) VALUES
('admin@test.com', '0555666777', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo Admin', 'admin', 1);

-- Cars for owner
INSERT INTO cars (license_plate, owner_id, brand, model, year, seats, status, type, transmission, fuel_type, description, location) VALUES
('30A-12345', 2, 'Toyota', 'Vios', 2020, 5, 'available', 'Sedan', 'automatic', 'gasoline', 'Xe gia đình tiết kiệm nhiên liệu', 'Hà Nội'),
('30B-67890', 2, 'Honda', 'City', 2021, 5, 'available', 'Sedan', 'automatic', 'gasoline', 'Xe sang trọng, tiện nghi', 'Hà Nội');
```

### Demo Flow theo Role:
1. **Renter Demo:** Login → Search → Book → Payment
2. **Owner Demo:** Login → Manage Cars → Approve Bookings → Revenue Stats
3. **Admin Demo:** Login → User Management → System Analytics

## TIPS CHO DEMO THEO ROLE

### 1. Chuyển đổi vai trò mượt mà:
- **"Bây giờ chúng ta sẽ chuyển sang góc độ của chủ xe..."**
- **"Cuối cùng, hãy xem vai trò quản trị viên..."**

### 2. Nhấn mạnh tính năng riêng:
- **Renter:** "Tìm kiếm, đặt xe, thanh toán"
- **Owner:** "Quản lý xe, phê duyệt, thống kê"
- **Admin:** "Quản lý hệ thống, phân tích"

### 3. Kết nối giữa các vai trò:
- **"Khi Renter đặt xe, Owner sẽ nhận được thông báo..."**
- **"Admin có thể theo dõi tất cả hoạt động..."**

**CHÚC BẠN THUYẾT TRÌNH THÀNH CÔNG! 🚀** 