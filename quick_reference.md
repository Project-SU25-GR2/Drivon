# QUICK REFERENCE - THUYẾT TRÌNH DRIVON

## 🎯 TỔNG QUAN (2 phút)
- **Tên:** Drivon - Hệ thống thuê xe ô tô
- **Tech Stack:** Spring Boot + React + MySQL
- **3 Roles:** Renter, Owner, Admin
- **Features:** Real-time, Payment, Security

## 🚀 DEMO WORKFLOW (8-10 phút)

### 1. Đăng nhập (1 phút)
```
URL: http://localhost:3000
Login: demo@test.com / password
Highlight: JWT + Google OAuth
```

### 2. Tìm xe (2 phút)
```
Route: /rent-car
Features: Filter, Search, Sort
Demo: Chọn xe Toyota Vios
```

### 3. Đặt xe (2 phút)
```
Steps: Chọn ngày → Địa điểm → Thông tin
Highlight: Auto price calculation
```

### 4. Thanh toán (2 phút)
```
Methods: QR Code, Bank Transfer, Cash
Demo: PayOS integration
```

### 5. Owner Dashboard (2 phút)
```
Login: owner@test.com
Route: /owner
Features: Quản lý xe, Thống kê
```

### 6. Admin Dashboard (1 phút)
```
Login: admin@test.com
Route: /adminSecret
Features: User management, Analytics
```

## 💡 TÍNH NĂNG NỔI BẬT

### Real-time Features
- ✅ WebSocket Chat
- ✅ Live Notifications
- ✅ Booking Status Updates

### Payment Integration
- ✅ PayOS QR Code
- ✅ Bank Transfer
- ✅ Cash Payment
- ✅ Webhook Handling

### Security
- ✅ JWT Authentication
- ✅ Role-based Access
- ✅ Document Verification

## 🏗️ KIẾN TRÚC

```
Frontend (React) ←→ Backend (Spring Boot) ←→ MySQL
                    ↓
              External Services
```

**Backend:** 20+ Controllers, Services, Repositories
**Database:** 15+ Tables
**External:** PayOS, Cloudinary, Email

## 📊 DATABASE SCHEMA

**Core Tables:**
- `users` - User management
- `cars` - Car information
- `bookings` - Rental records
- `payments` - Payment processing
- `reviews` - Rating system
- `notifications` - Real-time alerts

## 🔧 TECHNICAL HIGHLIGHTS

### Backend
- Spring Boot với RESTful APIs
- JPA/Hibernate cho database
- Spring Security cho authentication
- WebSocket cho real-time
- PayOS integration

### Frontend
- React với component-based architecture
- Context API cho state management
- React Router cho navigation
- Axios cho API calls
- Real-time WebSocket connection

### Database
- MySQL với normalized design
- Foreign key constraints
- Indexing cho performance
- Transaction management

## 🎤 SCRIPT HIGHLIGHTS

### Opening
*"Chào các bạn, hôm nay chúng tôi sẽ giới thiệu Drivon - một nền tảng thuê xe hoàn chỉnh với 3 vai trò người dùng và tích hợp thanh toán đa dạng."*

### Demo Flow
1. *"Đầu tiên, hãy xem cách đăng nhập..."*
2. *"Sau đó, người dùng có thể tìm kiếm xe..."*
3. *"Khi chọn xe, hệ thống tính toán giá tự động..."*
4. *"Thanh toán được tích hợp với PayOS..."*
5. *"Chủ xe có dashboard riêng..."*
6. *"Admin quản lý toàn bộ hệ thống..."*

### Closing
*"Drivon là một hệ thống thuê xe hoàn chỉnh với real-time features, payment integration, và security implementation. Cảm ơn các bạn!"*

## ⚡ QUICK COMMANDS

### Start System
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm start
```

### Test Accounts
```
Renter: demo@test.com / password
Owner: owner@test.com / password
Admin: admin@test.com / password
```

### Key URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Admin: http://localhost:3000/adminSecret
- Owner: http://localhost:3000/owner

## 🚨 BACKUP PLAN

### Nếu có lỗi:
1. **Bình tĩnh** và giải thích lỗi
2. **Chuyển sang screenshots** nếu cần
3. **Tập trung vào tính năng hoạt động**
4. **Giải thích technical architecture**

### Key Points để nhấn mạnh:
- ✅ Full-stack development
- ✅ Real-time communication
- ✅ Payment integration
- ✅ Security implementation
- ✅ Scalable architecture

## 📝 NOTES

### Technical Stack
- **Frontend:** React, Context API, Axios, WebSocket
- **Backend:** Spring Boot, JPA, Security, WebSocket
- **Database:** MySQL với 15+ tables
- **External:** PayOS, Cloudinary, Email

### Business Value
- Kết nối chủ xe và người thuê
- Quản lý tự động
- Thanh toán đa dạng
- Real-time communication

**CHÚC THUYẾT TRÌNH THÀNH CÔNG! 🚀** 