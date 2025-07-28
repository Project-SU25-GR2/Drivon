

-- Tạo database và sử dụng
CREATE DATABASE car_rental_system2;
USE car_rental_system2;

-- 1. Bảng users
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    enabled BIT(1) DEFAULT 1,
    reset_password_token VARCHAR(255),
    reset_password_token_expiry DATETIME(6),
    system_revenue_id BIGINT
);
ALTER TABLE users
MODIFY COLUMN role ENUM('renter', 'owner', 'admin','verify_owner', 'verify_user') DEFAULT 'renter';

-- 2. Bảng user_image
CREATE TABLE user_image (
    image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    document_type ENUM('cccd', 'license', 'passport', 'other') NOT NULL,
    description TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BIT(1) DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Bảng cars
CREATE TABLE cars (
    license_plate VARCHAR(15) PRIMARY KEY,
    owner_id BIGINT,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    seats INT,
    status VARCHAR(255) DEFAULT 'available',
    type VARCHAR(255),
    transmission ENUM('manual', 'automatic'),
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid'),
    fuel_consumption DOUBLE,
    description TEXT,
    location VARCHAR(255),
    main_image TEXT,
    average_rating DOUBLE,
    total_trips INT,
    contract_partners_id BIGINT,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. Bảng car_images
CREATE TABLE car_images (
    image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    car_id VARCHAR(15),
    image_url TEXT,
    type VARCHAR(255),
    FOREIGN KEY (car_id) REFERENCES cars(license_plate) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Bảng contract_partners
CREATE TABLE contract_partners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_number VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(20) NOT NULL,
    deposit DOUBLE NOT NULL,
    status VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    price_per_day DOUBLE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    pdf_url VARCHAR(255),
    users_id BIGINT,
    FOREIGN KEY (users_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 6. Bảng promotions
CREATE TABLE promotions (
    promo_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE,
    discount_percent INT CHECK (discount_percent BETWEEN 1 AND 100),
    valid_until DATETIME,
    max_uses INT
);

-- 7. Bảng bookings
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    renter_id BIGINT,
    car_id VARCHAR(15),
    start_time DATETIME,
    end_time DATETIME,
    pickup_location TEXT,
    dropoff_location TEXT,
    status ENUM('pending', 'approved', 'cancelled', 'ongoing', 'completed') DEFAULT 'pending',
    total_price DOUBLE,
    promotion_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (renter_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(license_plate) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(promo_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 8. Bảng payments
CREATE TABLE payments (
    payment_id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT,
    amount DOUBLE,
    payment_method VARCHAR(255),
    status VARCHAR(255) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    additional_requirements VARCHAR(255),
    car_id VARCHAR(255),
    discount_percent INT,
    order_code VARCHAR(255),
    payment_date DATETIME(6),
    promotion_code VARCHAR(255),
    rental_end_date DATETIME(6),
    rental_start_date DATETIME(6),
    bookings_booking_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(license_plate) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (bookings_booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. Bảng reviews
CREATE TABLE reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    reviewer_id BIGINT,
    reviewee_id BIGINT,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 10. Bảng notifications
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    type ENUM('SYSTEM', 'PROMO') NOT NULL,
    target_type ENUM('ALL_USERS', 'OWNER_ONLY', 'USER_SPECIFIC', 'ADMIN_ONLY') NOT NULL,
    target_user_id BIGINT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BIT(1) DEFAULT FALSE
);

-- 11. Bảng notification_reads
CREATE TABLE notification_reads (
    notification_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 12. Bảng conversations
CREATE TABLE conversations (
    conversation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pair (user1_id, user2_id)
);

-- 13. Bảng messages
CREATE TABLE messages (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 14. Bảng user_conversations
CREATE TABLE user_conversations (
    user_id BIGINT NOT NULL,
    conversation_id BIGINT NOT NULL,
    last_seen_message_id BIGINT,
    is_deleted TINYINT(1) DEFAULT FALSE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, conversation_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (last_seen_message_id) REFERENCES messages(message_id) ON DELETE SET NULL
);

-- 15. Bảng owner_wallet
CREATE TABLE owner_wallet (
    owner_id BIGINT PRIMARY KEY,
    total_profit DOUBLE DEFAULT 0,
    total_debt DOUBLE DEFAULT 0,
    balance DOUBLE DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    account_number VARCHAR(50),
    bank_name VARCHAR(100),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 16. Bảng owner_withdraw_requests
CREATE TABLE owner_withdraw_requests (
    request_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(255) DEFAULT 'pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME NULL,
    note TEXT,
    sign BIT(1) DEFAULT FALSE,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 17. Bảng system_revenue
CREATE TABLE system_revenue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL COMMENT 'REVENUE_IN, REVENUE_OUT, DEBT_CREATED, DEBT_COLLECTED',
    payment_method VARCHAR(50) COMMENT 'BANK, CASH',
    amount DOUBLE NOT NULL COMMENT 'Số tiền giao dịch',
    owner_id BIGINT COMMENT 'ID của owner',
    booking_id INT COMMENT 'ID của booking',
    payment_id VARCHAR(255) COMMENT 'ID của payment',
    description VARCHAR(500) COMMENT 'Mô tả giao dịch',
    transaction_date DATETIME NOT NULL COMMENT 'Ngày thực hiện giao dịch',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo record',
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' COMMENT 'CONFIRMED, PENDING, CANCELLED',
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_owner_id (owner_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_status (status),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE SET NULL
);

-- Thêm dữ liệu mẫu
INSERT INTO `users` (`email`, `phone`, `password`, `full_name`, `avatar_url`, `address`, `role`, `status`, `email_verified`, `phone_verified`, `google_id`, `created_at`, `enabled`, `reset_password_token`, `reset_password_token_expiry`) VALUES 
('warmhouse.charity.contact@gmail.com', '0394672210', '$2a$10$yiru8TtU.uXAYvd6UMTmdOdOVsyHTlxt8r9KB1GCMzP9vrUyELMhK', 'Trần Bình Vương', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749170969/wqyfz0uopurvoxiphx8z.jpg', 'xóm 4, nghi lâm, nghi lộc', 'admin', 'active', 1, 0, '116249314416777410764', '2025-06-06 00:49:13.432059', 1, NULL, NULL),
('vantdde180061@fpt.edu.vn', '0375277717', '$2a$10$xf1VczSHfJhQJuMD.uM1n.T8Z7Otnzg3i02wePmkyUyVgQb6Kbnu2', 'To Dinh Van (K18 DN)', NULL, NULL, 'admin', 'active', 1, 0, '103036093340334673905', '2025-06-06 01:04:00.301430', 1, NULL, NULL),
('lethecuong2k4@gmail.com', NULL, NULL, 'Cường', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749884082/cokt9korpzgng9oqpdxm.jpg', NULL, 'admin', 'active', 1, 0, '102928243161293663830', '2025-06-14 06:54:13.516203', 1, NULL, NULL),
('cuongltde180006@fpt.edu.vn', NULL, NULL, 'Le The Cuong (K18 DN)', NULL, NULL, 'renter', 'active', 1, 0, '114901012144518341837', '2025-06-14 06:59:45.037427', 1, NULL, NULL),
('cuongltfpt2k4@gmail.com', NULL, NULL, 'Thế Lê', NULL, NULL, 'owner', 'active', 1, 0, '111904973384188486259', '2025-06-14 07:17:56.679344', 1, NULL, NULL),
('quanhk1402@gmail.com', NULL, NULL, 'Minh Quân Phạm', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749917040/fsy4kibujoewhmy8zgxy.jpg', NULL, 'owner', 'active', 1, 0, '112552544055062048391', '2025-06-14 15:50:20.357445', 1, NULL, NULL),
('de180022tranbinhvuong@gmail.com', NULL, NULL, 'TRẦN BÌNH VƯƠNG', NULL, NULL, 'renter', 'active', 1, 0, '104228653661157612088', '2025-06-14 17:37:31.929707', 1, NULL, NULL),
('tranbinhvuong123456@gmail.com', NULL, NULL, 'Vương Trần Bình', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966020/tozlrafxdgiwlxtrzvy6.jpg', NULL, 'renter', 'active', 1, 0, '113138118160119322378', '2025-06-14 18:08:09.184763', 1, NULL, NULL),
('binhvuong6868999@gmail.com', '0394672255', '$2a$10$iHThHeJlLQVUjuUnToNMkOhKYdNC.8BaveDgEVp1dUnxtPMKT6llG', 'Trần Bình Vương', NULL, 'xóm 4, nghi lâm, nghi lộc', 'renter', 'active', 1, 0, NULL, '2025-06-15 15:34:01.005800', 1, NULL, NULL);

INSERT INTO `cars` (`license_plate`, `owner_id`, `brand`, `model`, `year`, `seats`, `status`, `type`, `transmission`, `fuel_type`, `fuel_consumption`, `description`, `location`, `main_image`) VALUES 
('37A40262', 1, 'Kia', 'sportage', 2024, 5, 'available', 'suv', 'automatic', 'gasoline', 8, 'màu xanh rêu', 'Nghệ An', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004763/gved8wcyporhcyrjeuao.webp'),
('38A1234', 1, 'Toyota', 'Camry', 2019, 5, 'available', 'sedan', 'automatic', 'gasoline', 5.8, 'Xe Camry cụ', 'Hà Tĩnh', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914635/nqvrsmjhqgdhksrivdln.png'),
('38A1235', 1, 'Kia', 'Morning', 2018, 4, 'available', 'hatchback', 'manual', 'gasoline', 5, 'Xe Kia Morning', 'Hà Tĩnh', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914830/kdrn4tpqtthyrj7t8yt9.jpg'),
('38A14204', 1, 'Toyota', 'Vios', 2016, 5, 'available', 'sedan', 'manual', 'gasoline', 5.8, 'Xe Vios G đời 2016', 'Hà Tĩnh', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1750002706/h7pwlztgae4olzzodn8h.jpg'),
('43A99900', 1, 'Ford', 'Raptor', 2024, 4, 'available', 'pickup', 'automatic', 'diesel', 10, 'màu đen, độ cản', 'TP HCM', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966332/sn2euer3rd66bb5e92kj.jpg'),
('43A99995', 1, 'BMW', '750i M sport', 2024, 4, 'available', 'sedan', 'automatic', 'gasoline', 10, 'màu đen', 'TP HCM', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914582/g6dhh5gi1anvcydc22tt.jpg'),
('43A99997', 1, 'VinFast', 'Vf9', 2024, 7, 'available', 'suv', 'automatic', 'electric', 10, 'màu xám', 'Hạ Long', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914214/kltcz77lx55pdpmdhb8w.jpg'),
('43A99998', 1, 'Toyota', 'Camry', 2024, 4, 'available', 'sedan', 'automatic', 'gasoline', 9.9, 'màu đen', 'Hà Nội', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914025/zpj6asnw0xuqrluyke8c.jpg'),
('43A99999', 1, 'Ford', 'Everest', 2024, 7, 'available', 'suv', 'automatic', 'gasoline', 9, 'màu đen', 'Đã Nẵng', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1750038127/lehjtzxzx3d2abrhusdj.png'),
('79A13334', 1, 'Toyota', 'Vios', 2022, 5, 'available', 'sedan', 'automatic', 'gasoline', 5, 'Màu trắng', 'khánh hòa', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922416/jpvagdeke5ofmugmsct8.webp'),
('79A13337', 1, 'Hyundai', 'Sonata', 2025, 5, 'available', 'sedan', 'automatic', 'gasoline', 10, 'Màu trắng', 'Khánh Hoà', 'https://res.cloudinary.com/dxhcqas4b/image/upload/v1749959652/ryetlxpk1tk9lw4s7tzx.png');

INSERT INTO `car_images` (`car_id`, `image_url`) VALUES 
('43A99998','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914037/upxoj1sjldp18097pppy.jpg'),
('43A99998','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914036/wnypodctmjpquvnesuer.jpg'),
('43A99998','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914036/cci3vuytvvvhpkgpa0ht.jpg'),
('43A99997','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914272/anqvwhnnztpmkat7l60y.jpg'),
('43A99997','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914272/lhhftbt4nmtcqvdlua69.jpg'),
('43A99997','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914278/a4yglywjnjaqpyhgxfmv.png'),
('43A99995','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914592/jdsctulayfhtvvppl3vo.jpg'),
('43A99995','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914592/jgin114aapqy9wgz4xzo.jpg'),
('43A99995','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914592/czxbn96hskdrly7ai9mk.webp'),
('38A1235','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914840/zekorazqfu1rurfjvcrb.png'),
('38A1235','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914850/r35fhdsxg7vsjeodja8s.jpg'),
('38A1235','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749914840/ldvvdwmsjdhusohfyme1.jpg'),
('79A13334','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922420/zrdrpsfhdqdkc4vgxd7j.jpg'),
('79A13334','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922422/jngfegeq7pz3y9tu0rxo.jpg'),
('79A13334','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749922425/qgrbaxdkbxuwibmtqpta.jpg'),
('79A13337','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749959657/bu4q8swrme1ys9vnf9yw.jpg'),
('79A13337','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749959661/pom1pmotctlbjqouam9u.jpg'),
('43A99900','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966338/ql5so35rj9h6has638xd.jpg'),
('43A99900','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966338/u86ezut7sa4hpyvco8yw.jpg'),
('43A99900','https://res.cloudinary.com/dxhcqas4b/image/upload/v1749966338/vdwaaxjymhmtm9gnmfhp.jpg'),
('37A40262','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004971/bu8sibdocnd61aycmfla.png'),
('37A40262','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004980/ic09xl9wznagpea4yk4u.jpg'),
('37A40262','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750004988/iqqer4nx4f50jxtb3mgz.png'),
('38A14204','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032835/zocfjex3xv7kho94cnqu.jpg'),
('38A14204','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032842/uhry5lej3caqowz8z0zn.jpg'),
('38A14204','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750032849/mabossmctasiofb9rzaw.jpg'),
('38A1234','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750034874/txxn4syf8cj7yv48kamd.jpg'),
('38A1234','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750034880/wladsqabup81eaft5j6t.jpg'),
('38A1234','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750034891/hmzbqvcui3ty5we9vfi5.jpg'),
('43A99999','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750037253/h01rrcdxadk3uh0c5qfp.png'),
('43A99999','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750037264/x9aqgmi1wergnfyum75e.png'),
('43A99999','https://res.cloudinary.com/dxhcqas4b/image/upload/v1750038234/k82gfputzkzdaxwrfajl.jpg');

INSERT INTO `contract_partners` (`contract_number`, `customer_id`, `deposit`, `status`, `name`, `phone`, `email`, `price_per_day`, `created_at`) VALUES 
('HD202506140049', '1', 0, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 5000, NULL),
('HD202506146073', '1', 500000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 1000000, NULL),
('HD202506149104', '1', 500000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 1000000, NULL),
('HD202506144270', '1', 900000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 1500000, NULL),
('HD202506147038', '1', 800000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 199999, NULL),
('HD202506146676', '1', 1000000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 2000000, NULL),
('HD202506146865', '1', 900000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 500000, NULL),
('HD202506147807', '1', 350000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 499999, NULL),
('HD202506157594', '1', 300000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 600000, NULL),
('HD202506152933', '1', 400000, 'ACTIVE_LEASE', 'VƯƠNG TRẦN BÌNH', '0394672210', 'binhvuong221004@gmail.com', 699999, NULL),
('HD202506151517', '1', 800000, 'ACTIVE_LEASE', 'Vương Trần Bình', '0394672210', 'tranbinhvuong123456@gmail.com', 1500000, NULL);

INSERT INTO `promotions` (`code`, `discount_percent`, `valid_until`, `max_uses`) VALUES 
('SUMMER25',25,'2025-08-31 23:59:59',100),
('NEWYEAR50',50,'2026-01-01 23:59:59',500),
('WELCOME10',10,'2025-12-31 23:59:59',1000),
('FLASH70',70,'2025-07-01 23:59:59',50);
