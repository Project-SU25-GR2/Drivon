# QUICK REFERENCE - DEMO THEO VAI TRÒ

## 🎯 TỔNG QUAN (2 phút)
- **Tên:** Drivon - Hệ thống thuê xe ô tô
- **3 Vai trò:** Renter, Owner, Admin
- **Tech Stack:** Spring Boot + React + MySQL
- **Features:** Real-time, Payment, Security

## 🚀 DEMO WORKFLOW THEO ROLE (10-12 phút)

### ROLE 1: RENTER - NGƯỜI THUÊ XE (4 phút)

#### Login & Setup (1 phút)
```
URL: http://localhost:3000
Login: renter@test.com / password
Highlight: JWT + Google OAuth
```

#### Tìm kiếm xe (1.5 phút)
```
Route: /rent-car
Features: Filter, Search, Sort
Demo: Chọn xe Toyota Vios
```

#### Đặt xe (1.5 phút)
```
Steps: Chọn ngày → Địa điểm → Thông tin
Highlight: Auto price calculation
```

**Key Points:**
- ✅ Tìm kiếm xe với filter đa dạng
- ✅ Xem chi tiết xe với ảnh và đánh giá
- ✅ Đặt xe với tính toán giá tự động
- ✅ Thanh toán đa dạng (QR, Bank, Cash)

### ROLE 2: OWNER - CHỦ XE (4 phút)

#### Login Owner (30 giây)
```
Login: owner@test.com / password
Route: /owner
```

#### Quản lý xe (2 phút)
```
Features: Thêm xe, Upload ảnh, Chỉnh sửa
Demo: Thêm xe mới với Cloudinary
```

#### Quản lý đặt xe (1 phút)
```
Features: Phê duyệt, Từ chối, Lịch sử
Demo: Real-time notifications
```

#### Thống kê doanh thu (30 giây)
```
Features: Biểu đồ, Revenue tracking
Demo: Analytics dashboard
```

**Key Points:**
- ✅ Quản lý nhiều xe với upload ảnh
- ✅ Phê duyệt đặt xe real-time
- ✅ Thống kê doanh thu chi tiết
- ✅ Dashboard quản lý chuyên nghiệp

### ROLE 3: ADMIN - QUẢN TRỊ VIÊN (2 phút)

#### Login Admin (30 giây)
```
Login: admin@test.com / password
Route: /adminSecret
```

#### Quản lý người dùng (1 phút)
```
Features: User list, Role management
Demo: Thay đổi role user
```

#### Thống kê tổng quan (30 giây)
```
Features: System analytics, Overview
Demo: Dashboard tổng quan
```

**Key Points:**
- ✅ Quản lý tất cả users và roles
- ✅ Thống kê tổng quan hệ thống
- ✅ Phân tích dữ liệu chi tiết
- ✅ Quản lý promotions và settings

## 💡 TÍNH NĂNG CHUNG (3 phút)

### Real-time Features
- ✅ WebSocket Chat cho tất cả roles
- ✅ Live Notifications real-time
- ✅ Booking Status Updates

### Payment Integration
- ✅ PayOS QR Code cho Renter
- ✅ Revenue tracking cho Owner
- ✅ Payment analytics cho Admin

### Security & Authentication
- ✅ JWT Authentication cho tất cả roles
- ✅ Role-based Access Control
- ✅ Document Verification System

## 🏗️ KIẾN TRÚC THEO ROLE

```
Frontend (React) ←→ Backend (Spring Boot) ←→ MySQL
                    ↓
              External Services
```

**Role-based APIs:**
- **Renter APIs:** Booking, Payment, Review
- **Owner APIs:** Car Management, Booking Approval, Revenue
- **Admin APIs:** User Management, System Analytics, Promotions

## 📊 DATABASE SCHEMA THEO ROLE

**Renter Tables:**
- `users` (renter role)
- `bookings` (rental records)
- `payments` (payment processing)
- `reviews` (rating system)

**Owner Tables:**
- `cars` (car information)
- `owner_wallet` (revenue tracking)
- `car_images` (image management)

**Admin Tables:**
- `users` (all roles)
- `system_revenue` (overall analytics)
- `promotions` (promotion management)

## 🎤 SCRIPT HIGHLIGHTS THEO ROLE

### Opening
*"Chào các bạn, hôm nay chúng tôi sẽ giới thiệu Drivon - một nền tảng thuê xe với 3 vai trò người dùng chính: Renter (người thuê), Owner (chủ xe), và Admin (quản trị viên)."*

### Role Transitions
1. **Renter Demo:** *"Đầu tiên, chúng ta sẽ xem trải nghiệm của người thuê xe..."*
2. **Owner Demo:** *"Tiếp theo, chúng ta sẽ chuyển sang góc độ của chủ xe..."*
3. **Admin Demo:** *"Cuối cùng, chúng ta sẽ xem vai trò quản trị viên..."*

### Closing
*"Drivon là một hệ thống thuê xe hoàn chỉnh với 3 vai trò người dùng, mỗi vai trò có trải nghiệm riêng nhưng đều được kết nối thông qua real-time features và payment integration."*

## ⚡ QUICK COMMANDS THEO ROLE

### Start System
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm start
```

### Test Accounts theo Role
```
Renter: renter@test.com / password
Owner: owner@test.com / password
Admin: admin@test.com / password
```

### Key URLs theo Role
- **Renter:** http://localhost:3000/rent-car
- **Owner:** http://localhost:3000/owner
- **Admin:** http://localhost:3000/adminSecret

## 🚨 BACKUP PLAN THEO ROLE

### Nếu có lỗi với một role:
1. **Bình tĩnh** và giải thích lỗi
2. **Chuyển sang role khác** nếu cần
3. **Sử dụng screenshots** cho role bị lỗi
4. **Tập trung vào tính năng hoạt động**

### Key Points cho từng role:
- **Renter:** Tìm kiếm, đặt xe, thanh toán
- **Owner:** Quản lý xe, phê duyệt, thống kê
- **Admin:** Quản lý hệ thống, phân tích

## 📝 ROLE-SPECIFIC FEATURES

### Renter Features
- ✅ Car search và filtering
- ✅ Booking management
- ✅ Payment processing
- ✅ Review system

### Owner Features
- ✅ Car management
- ✅ Booking approval
- ✅ Revenue tracking
- ✅ Analytics dashboard

### Admin Features
- ✅ User management
- ✅ System analytics
- ✅ Promotion management
- ✅ Overall monitoring

## 🎯 BUSINESS VALUE THEO ROLE

### Renter Value
- Tìm xe dễ dàng với filter đa dạng
- Đặt xe nhanh chóng và thuận tiện
- Thanh toán an toàn và đa dạng
- Đánh giá và review hệ thống

### Owner Value
- Quản lý xe hiệu quả
- Tăng doanh thu từ cho thuê
- Thống kê chi tiết và real-time
- Dashboard quản lý chuyên nghiệp

### Admin Value
- Quản lý toàn bộ hệ thống
- Phân tích dữ liệu tổng quan
- Kiểm soát chất lượng dịch vụ
- Tối ưu hóa hoạt động

**CHÚC BẠN THUYẾT TRÌNH THÀNH CÔNG! 🚀** 