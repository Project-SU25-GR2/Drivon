-- Bảng notifications cho hệ thống thông báo
-- Tương thích với entity Notification.java

-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS notifications;

-- Tạo bảng notifications mới
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL COMMENT 'Nội dung thông báo',
    type ENUM('SYSTEM', 'PROMO') NOT NULL DEFAULT 'SYSTEM' COMMENT 'Loại thông báo: SYSTEM (hệ thống), PROMO (khuyến mãi)',
    target_type ENUM('ALL_USERS', 'OWNER_ONLY', 'USER_SPECIFIC') NOT NULL DEFAULT 'ALL_USERS' COMMENT 'Đối tượng nhận: ALL_USERS (tất cả), OWNER_ONLY (chỉ chủ xe), USER_SPECIFIC (user cụ thể)',
    target_user_id BIGINT NULL COMMENT 'ID user cụ thể (chỉ dùng khi target_type = USER_SPECIFIC)',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Trạng thái đã đọc: true/false',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo thông báo',
    
    -- Foreign key constraints
    FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes để tối ưu hiệu suất truy vấn
    INDEX idx_target_type (target_type),
    INDEX idx_target_user (target_user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type_target (type, target_type),
    INDEX idx_user_read (target_user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ thông báo hệ thống';

-- Thêm một số thông báo mẫu
INSERT INTO notifications (content, type, target_type, is_read, created_at) VALUES
('Chào mừng bạn đến với hệ thống thuê xe Drivon!', 'SYSTEM', 'ALL_USERS', FALSE, NOW()),
('Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai', 'SYSTEM', 'ALL_USERS', FALSE, NOW()),
('Khuyến mãi 20% cho tất cả xe trong tháng này!', 'PROMO', 'ALL_USERS', FALSE, NOW()),
('Cập nhật chính sách bảo hiểm xe mới', 'SYSTEM', 'OWNER_ONLY', FALSE, NOW());

-- Tạo view để dễ dàng truy vấn thông báo cho user
CREATE OR REPLACE VIEW user_notifications AS
SELECT 
    n.notification_id,
    n.content,
    n.type,
    n.target_type,
    n.target_user_id,
    n.is_read,
    n.created_at,
    u.full_name as target_user_name,
    u.email as target_user_email
FROM notifications n
LEFT JOIN users u ON n.target_user_id = u.user_id
ORDER BY n.created_at DESC;

-- Tạo view thống kê thông báo
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    type,
    target_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read_count,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count,
    DATE(created_at) as created_date
FROM notifications
GROUP BY type, target_type, DATE(created_at)
ORDER BY created_date DESC;

-- Tạo stored procedure để tạo thông báo
DELIMITER //
CREATE PROCEDURE CreateNotification(
    IN p_content TEXT,
    IN p_type ENUM('SYSTEM', 'PROMO'),
    IN p_target_type ENUM('ALL_USERS', 'OWNER_ONLY', 'USER_SPECIFIC'),
    IN p_target_user_id BIGINT
)
BEGIN
    INSERT INTO notifications (content, type, target_type, target_user_id, is_read, created_at)
    VALUES (p_content, p_type, p_target_type, p_target_user_id, FALSE, NOW());
    
    SELECT LAST_INSERT_ID() as notification_id;
END //
DELIMITER ;

-- Tạo stored procedure để đánh dấu đã đọc
DELIMITER //
CREATE PROCEDURE MarkNotificationAsRead(IN p_notification_id BIGINT)
BEGIN
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE notification_id = p_notification_id;
    
    SELECT ROW_COUNT() as updated_rows;
END //
DELIMITER ;

-- Tạo stored procedure để đếm thông báo chưa đọc cho user
DELIMITER //
CREATE PROCEDURE GetUnreadCountForUser(IN p_user_id BIGINT, IN p_user_role VARCHAR(20))
BEGIN
    SELECT COUNT(*) as unread_count
    FROM notifications n
    WHERE n.is_read = FALSE 
    AND (
        n.target_type = 'ALL_USERS' 
        OR (n.target_type = 'OWNER_ONLY' AND p_user_role = 'owner')
        OR (n.target_type = 'USER_SPECIFIC' AND n.target_user_id = p_user_id)
    );
END //
DELIMITER ;

-- Tạo trigger để tự động cập nhật thời gian khi tạo thông báo mới
DELIMITER //
CREATE TRIGGER before_notification_insert
BEFORE INSERT ON notifications
FOR EACH ROW
BEGIN
    IF NEW.created_at IS NULL THEN
        SET NEW.created_at = NOW();
    END IF;
END //
DELIMITER ;

-- Tạo trigger để log khi thông báo được đánh dấu đã đọc
DELIMITER //
CREATE TRIGGER after_notification_update
AFTER UPDATE ON notifications
FOR EACH ROW
BEGIN
    IF OLD.is_read = FALSE AND NEW.is_read = TRUE THEN
        -- Có thể thêm log vào bảng khác nếu cần
        INSERT INTO notification_read_log (notification_id, read_at) 
        VALUES (NEW.notification_id, NOW());
    END IF;
END //
DELIMITER ;

-- Tạo bảng log cho việc đọc thông báo (tùy chọn)
CREATE TABLE IF NOT EXISTS notification_read_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE
); 