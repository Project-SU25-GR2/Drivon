-- Tạo bảng system_revenue để tracking dòng tiền hệ thống
CREATE TABLE IF NOT EXISTS system_revenue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL COMMENT 'REVENUE_IN, REVENUE_OUT, DEBT_CREATED, DEBT_COLLECTED',
    payment_method VARCHAR(50) COMMENT 'BANK, CASH',
    amount DECIMAL(15,2) NOT NULL COMMENT 'Số tiền giao dịch',
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
    INDEX idx_status (status)
) COMMENT 'Bảng tracking dòng tiền hệ thống';

-- Thêm sample data để test (optional)
-- INSERT INTO system_revenue (transaction_type, payment_method, amount, owner_id, description, transaction_date, status) VALUES 
-- ('REVENUE_IN', 'BANK', 50000.00, 1, 'System fee 2% from bank payment', NOW(), 'CONFIRMED'),
-- ('DEBT_CREATED', 'CASH', 30000.00, 2, 'System debt 2% from cash payment', NOW(), 'CONFIRMED'),
-- ('DEBT_COLLECTED', 'CASH', 15000.00, 2, 'Debt collection from owner', NOW(), 'CONFIRMED'),
-- ('REVENUE_OUT', '', 100000.00, 1, 'Withdrawal to owner bank account', NOW(), 'CONFIRMED'); 