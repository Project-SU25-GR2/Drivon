-- Xóa database nếu đã tồn tại
DROP DATABASE IF EXISTS car_rental_system2;

-- Tạo database và sử dụng
CREATE DATABASE car_rental_system2;
USE car_rental_system2;

-- 1. Bảng users
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(100),
    avatar_url TEXT,
    address TEXT,
    role ENUM('renter', 'owner', 'admin') DEFAULT 'renter',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(100) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng user_verification
CREATE TABLE user_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    otp_code VARCHAR(10),
    type ENUM('email', 'phone', 'reset_password'),
    expires_at DATETIME,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_expire (user_id, expires_at)
);

-- 3. Bảng cars (license_plate là khóa chính)
CREATE TABLE cars (
    license_plate VARCHAR(15) PRIMARY KEY,
    owner_id INT,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    description TEXT,
    status ENUM('available', 'unavailable', 'hidden') DEFAULT 'available',
    location VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. Bảng car_images
CREATE TABLE car_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    car_id VARCHAR(15),
    image_url TEXT,
    FOREIGN KEY (car_id) REFERENCES cars(license_plate) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Bảng contract_partners
CREATE TABLE contract_partners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_number VARCHAR(20) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    car_id VARCHAR(15) ,
    customer_id VARCHAR(20) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    status VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    cccd VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(license_plate) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 6. Bảng bookings
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    renter_id INT,
    car_id VARCHAR(15),
    start_time DATETIME,
    end_time DATETIME,
    pickup_location TEXT,
    dropoff_location TEXT,
    status ENUM('pending', 'approved', 'cancelled', 'ongoing', 'completed') DEFAULT 'pending',
    total_price DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (renter_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(license_plate) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Bảng payments
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    user_id INT,
    amount DECIMAL(10,2),
    payment_method ENUM('credit_card', 'bank', 'e_wallet'),
    status ENUM('paid', 'refunded', 'pending') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 8. Bảng reviews
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    reviewer_id INT,
    reviewee_id INT,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 9. Bảng complaints
CREATE TABLE complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    user_id INT,
    target_user_id INT,
    description TEXT,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 10. Bảng notifications
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    content TEXT,
    type ENUM('system', 'message', 'promo'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11. Bảng support_requests
CREATE TABLE support_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    subject VARCHAR(255),
    message TEXT,
    status ENUM('pending', 'responded', 'closed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12. Bảng promotions
CREATE TABLE promotions (
    promo_id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE,
    discount_percent INT CHECK (discount_percent BETWEEN 1 AND 100),
    valid_until DATETIME,
    max_uses INT
);

-- 13. Bảng user_promotions
CREATE TABLE user_promotions (
    user_id INT,
    promo_id INT,
    used BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, promo_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (promo_id) REFERENCES promotions(promo_id)
);

-- 14. Bảng payment_methods
CREATE TABLE payment_methods (
    method_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type ENUM('credit_card', 'bank', 'e_wallet'),
    provider_name VARCHAR(100),
    account_number VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 15. Bảng loyalty_points
CREATE TABLE loyalty_points (
    user_id INT PRIMARY KEY,
    points INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 16. Bảng rental_contracts
CREATE TABLE rental_contracts (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_date DATE NOT NULL,
    renter_id INT NOT NULL,
    renter_full_name VARCHAR(100),
    renter_phone VARCHAR(20),
    renter_id_number VARCHAR(20),
    renter_email VARCHAR(100),
    owner_id INT NOT NULL,
    owner_company_name VARCHAR(100),
    owner_phone VARCHAR(20),
    owner_email VARCHAR(100),
    booking_id INT NOT NULL,
    agreed_terms TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (renter_id) REFERENCES users(user_id),
    FOREIGN KEY (owner_id) REFERENCES users(user_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- VIEW: income_report
CREATE VIEW income_report AS
SELECT 
    c.owner_id,
    b.car_id,
    SUM(b.total_price) AS total_income
FROM bookings b
JOIN cars c ON b.car_id = c.license_plate
WHERE b.status = 'completed'
GROUP BY c.owner_id, b.car_id;

-- VIEW: booking_stats
CREATE VIEW booking_stats AS
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS total_bookings
FROM bookings
GROUP BY DATE(created_at);

-- VIEW: complaints_report
CREATE VIEW complaints_report AS
SELECT 
    status,
    COUNT(*) AS total
FROM complaints
GROUP BY status;
