-- Script để cập nhật enum status của bảng cars để thêm trạng thái 'rented'
-- Chạy script này trên database hiện tại

-- Cập nhật enum status của bảng cars
ALTER TABLE cars MODIFY COLUMN status ENUM('available', 'unavailable', 'hidden', 'rented') DEFAULT 'available';

-- Cập nhật trạng thái xe dựa trên trạng thái booking hiện tại
UPDATE cars c 
SET c.status = 'rented' 
WHERE EXISTS (
    SELECT 1 FROM bookings b 
    WHERE b.car_id = c.license_plate 
    AND b.status IN ('pending', 'ongoing')
);

-- Cập nhật trạng thái xe về available cho các booking đã hoàn thành hoặc bị hủy
UPDATE cars c 
SET c.status = 'available' 
WHERE EXISTS (
    SELECT 1 FROM bookings b 
    WHERE b.car_id = c.license_plate 
    AND b.status IN ('completed', 'cancelled', 'approved')
    AND NOT EXISTS (
        SELECT 1 FROM bookings b2 
        WHERE b2.car_id = c.license_plate 
        AND b2.status IN ('pending', 'ongoing')
    )
); 