# Tối ưu hóa Cache cho Drivon

## Tổng quan

Hệ thống đã được tối ưu hóa để giảm số lượng API calls và cải thiện hiệu suất bằng cách:

1. **API Endpoint tổng hợp**: Tạo endpoint `/api/cars/active-lease-with-details` để lấy tất cả dữ liệu cần thiết trong 1 request
2. **React Context**: Sử dụng `CarDataContext` để cache dữ liệu và tránh load lại khi không cần thiết
3. **Cache timeout**: Dữ liệu được cache trong 5 phút, sau đó tự động refresh

## Các thay đổi chính

### Backend

#### 1. Endpoint mới trong CarController
```java
@GetMapping("/active-lease-with-details")
public ResponseEntity<?> getActiveLeaseCarsWithDetails()
```
- Trả về danh sách xe cùng với thông tin contract và review stats
- Giảm từ N+1 requests xuống còn 1 request duy nhất

### Frontend

#### 1. CarDataContext (`frontend/src/contexts/CarDataContext.js`)
- Quản lý cache dữ liệu xe toàn cục
- Cache timeout: 5 phút
- Cung cấp các methods:
  - `fetchCarsData()`: Load dữ liệu từ API
  - `refreshCarsData()`: Force refresh dữ liệu
  - `getCarByLicensePlate()`: Lấy xe theo biển số
  - `getCarsByFilter()`: Lọc xe theo điều kiện

#### 2. Components đã được cập nhật
- **RentCar**: Sử dụng Context thay vì gọi nhiều API riêng lẻ
- **HomeContent**: Sử dụng Context để lấy locations
- **ViewCarDetail**: Sử dụng Context nếu có, fallback về API riêng lẻ nếu không có

## Cách sử dụng

### 1. Sử dụng CarDataContext trong component

```javascript
import { useCarData } from '../../contexts/CarDataContext';

const MyComponent = () => {
  const { 
    carsData, 
    loading, 
    error, 
    fetchCarsData,
    refreshCarsData 
  } = useCarData();

  useEffect(() => {
    fetchCarsData(); // Load dữ liệu nếu chưa có hoặc đã hết hạn
  }, [fetchCarsData]);

  // Sử dụng carsData...
};
```

### 2. Force refresh khi cần thiết

```javascript
import { useCarDataRefresh } from '../../hooks/useCarDataRefresh';

const MyComponent = () => {
  const { refreshData } = useCarDataRefresh();

  const handleRefresh = async () => {
    await refreshData(); // Force refresh dữ liệu
  };
};
```

### 3. Lấy xe theo biển số

```javascript
const { getCarByLicensePlate } = useCarData();
const car = getCarByLicensePlate('30A-12345');
```

## Lợi ích

### Trước khi tối ưu
- Mỗi lần vào trang RentCar: 1 + 2N requests (N = số xe)
- Ví dụ: 10 xe = 21 requests
- Không có cache, load lại mỗi lần refresh

### Sau khi tối ưu
- Mỗi lần vào trang RentCar: 1 request duy nhất
- Cache trong 5 phút, không load lại nếu dữ liệu còn mới
- Giảm 95% số lượng API calls

## Cấu hình

### Cache timeout
Có thể thay đổi trong `CarDataContext.js`:
```javascript
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 phút
```

### API endpoint
Endpoint mới: `http://localhost:8080/api/cars/active-lease-with-details`

## Troubleshooting

### 1. Dữ liệu không cập nhật
- Sử dụng `refreshCarsData()` để force refresh

### 2. Lỗi API
- Kiểm tra backend logs
- Đảm bảo endpoint `/active-lease-with-details` hoạt động

### 3. Cache không hoạt động
- Kiểm tra CarDataProvider đã wrap App component
- Kiểm tra console logs 