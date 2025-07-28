# SCRIPT DEMO THUYẾT TRÌNH DRIVON

## PHẦN 1: GIỚI THIỆU (2 phút)

### Slide 1: Tổng quan dự án
**"Chào các bạn, hôm nay nhóm chúng tôi sẽ giới thiệu về dự án Drivon - một nền tảng thuê xe ô tô hoàn chỉnh."**

**Điểm nổi bật:**
- ✅ Hệ thống thuê xe end-to-end
- ✅ 3 vai trò người dùng: Renter, Owner, Admin
- ✅ Tích hợp thanh toán đa dạng
- ✅ Real-time communication
- ✅ Bảo mật cao với JWT

---

## PHẦN 2: DEMO WORKFLOW (8-10 phút)

### Bước 1: Đăng ký/Đăng nhập (1 phút)
**"Đầu tiên, hãy xem cách người dùng đăng ký và đăng nhập vào hệ thống."**

**Demo:**
1. Mở trang chủ `http://localhost:3000`
2. Click "Đăng nhập" → Chọn "Đăng ký"
3. Điền thông tin: Email, Phone, Password
4. Hoặc đăng nhập bằng Google OAuth
5. **"Hệ thống sử dụng JWT để bảo mật và Google OAuth để tiện lợi."**

### Bước 2: Tìm kiếm và xem xe (2 phút)
**"Sau khi đăng nhập, người dùng có thể tìm kiếm xe phù hợp."**

**Demo:**
1. Vào trang "Thuê xe" (`/rent-car`)
2. **"Hệ thống hiển thị danh sách xe với filter đa dạng:"**
   - Filter theo: Brand, Model, Year, Seats
   - Sort theo: Price, Rating, Date
   - Search theo: Location, Brand
3. Click vào một xe để xem chi tiết
4. **"Mỗi xe có thông tin đầy đủ: ảnh, mô tả, đánh giá, lịch sử thuê."**

### Bước 3: Đặt xe (2 phút)
**"Khi chọn được xe phù hợp, người dùng tiến hành đặt xe."**

**Demo:**
1. Chọn ngày bắt đầu và kết thúc
2. Chọn địa điểm nhận và trả xe
3. **"Hệ thống tự động tính toán giá tiền dựa trên thời gian và loại xe."**
4. Điền thông tin cá nhân
5. **"Hệ thống kiểm tra tính khả dụng của xe trong thời gian đã chọn."**

### Bước 4: Thanh toán (2 phút)
**"Đây là phần quan trọng - hệ thống thanh toán đa dạng."**

**Demo:**
1. Chọn phương thức thanh toán:
   - **QR Code (PayOS):** "Tích hợp với PayOS để tạo QR code thanh toán"
   - **Bank Transfer:** "Chuyển khoản trực tiếp"
   - **Cash Payment:** "Thanh toán tiền mặt"
2. **"Hệ thống tạo order và redirect đến trang thanh toán"**
3. **"Webhook real-time cập nhật trạng thái thanh toán"**

### Bước 5: Quản lý đặt xe (Owner) (2 phút)
**"Bây giờ chúng ta xem góc độ của chủ xe."**

**Demo:**
1. Đăng nhập với tài khoản Owner
2. Vào "Quản lý xe" (`/owner`)
3. **"Chủ xe có thể:"**
   - Thêm xe mới với ảnh
   - Xem danh sách đặt xe
   - Phê duyệt/từ chối đặt xe
   - Xem thống kê doanh thu
4. **"Hệ thống thông báo real-time khi có đặt xe mới"**

### Bước 6: Admin Dashboard (1 phút)
**"Cuối cùng là góc độ quản trị viên."**

**Demo:**
1. Đăng nhập Admin (`/adminSecret`)
2. **"Admin có thể:"**
   - Quản lý tất cả người dùng
   - Xem thống kê tổng quan
   - Quản lý khuyến mãi
   - Xử lý yêu cầu hủy đặt xe

---

## PHẦN 3: TÍNH NĂNG NỔI BẬT (3 phút)

### Slide: Real-time Features
**"Hệ thống có nhiều tính năng real-time:"**

1. **WebSocket Chat:** "Người dùng có thể chat trực tiếp"
2. **Real-time Notifications:** "Thông báo tức thì khi có cập nhật"
3. **Live Booking Status:** "Trạng thái đặt xe cập nhật real-time"

### Slide: Payment Integration
**"Tích hợp thanh toán hoàn chỉnh:"**

1. **PayOS Integration:** "QR code thanh toán"
2. **Webhook Handling:** "Cập nhật trạng thái tự động"
3. **Multiple Payment Methods:** "Đa dạng phương thức"

### Slide: Security Features
**"Bảo mật đa lớp:"**

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

### Slide: Database Design
**"Database có 15+ bảng chính:"**
- Users, Cars, Bookings, Payments
- Reviews, Notifications, Contracts
- OwnerWallet, SystemRevenue

---

## PHẦN 5: KẾT LUẬN (1 phút)

**"Drivon là một hệ thống thuê xe hoàn chỉnh với:"**
- ✅ Full-stack development
- ✅ Real-time features
- ✅ Payment integration
- ✅ Security implementation
- ✅ Scalable architecture

**"Cảm ơn các bạn đã lắng nghe. Xin mời câu hỏi!"**

---

## CHUẨN BỊ TRƯỚC DEMO:

### 1. Dữ liệu test:
```sql
-- Tạo tài khoản test
INSERT INTO users (email, phone, password, full_name, role) VALUES
('demo@test.com', '0123456789', 'password', 'Demo User', 'renter'),
('owner@test.com', '0987654321', 'password', 'Demo Owner', 'owner'),
('admin@test.com', '0555666777', 'password', 'Demo Admin', 'admin');

-- Tạo xe test
INSERT INTO cars (license_plate, owner_id, brand, model, year, seats, status) VALUES
('30A-12345', 2, 'Toyota', 'Vios', 2020, 5, 'available'),
('30B-67890', 2, 'Honda', 'City', 2021, 5, 'available');
```

### 2. Checklist trước demo:
- [ ] Backend chạy trên port 8080
- [ ] Frontend chạy trên port 3000
- [ ] Database có dữ liệu test
- [ ] PayOS config đúng
- [ ] Cloudinary config đúng
- [ ] Email service hoạt động

### 3. Backup plan:
- Nếu có lỗi, chuyển sang demo screenshots
- Chuẩn bị video demo dự phòng
- Có sẵn slides với screenshots

### 4. Tips khi demo:
- Nói chậm và rõ ràng
- Giải thích từng bước
- Tập trung vào business logic
- Sẵn sàng trả lời câu hỏi technical 