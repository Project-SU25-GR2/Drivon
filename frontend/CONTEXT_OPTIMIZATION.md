# Context Optimization for Rental History and Car Management

## Tổng quan

Đã thêm 2 context mới để tối ưu hóa việc quản lý dữ liệu và giảm số lượng API requests:

1. **RentalHistoryContext** - Quản lý dữ liệu lịch sử thuê xe
2. **CarManagementContext** - Quản lý dữ liệu xe của chủ sở hữu

## Các Context đã tạo

### 1. RentalHistoryContext (`frontend/src/contexts/RentalHistoryContext.js`)

**Chức năng:**
- Lưu trữ dữ liệu lịch sử thuê xe với cache 5 phút
- Cung cấp các hàm để fetch, refresh và cập nhật dữ liệu
- Tự động cập nhật state khi có thay đổi

**API:**
- `fetchRentalsData(userId, forceRefresh)` - Lấy dữ liệu thuê xe
- `refreshRentalsData(userId)` - Refresh dữ liệu
- `updateRentalStatus(rentalId, newStatus)` - Cập nhật trạng thái thuê xe
- `getRentalsByFilter(filterFn)` - Lọc dữ liệu theo điều kiện

### 2. CarManagementContext (`frontend/src/contexts/CarManagementContext.js`)

**Chức năng:**
- Lưu trữ dữ liệu xe của chủ sở hữu với cache 5 phút
- Tự động kết hợp mainImage và otherImages
- Cung cấp các hàm CRUD cho xe

**API:**
- `fetchCarsData(userId, forceRefresh)` - Lấy dữ liệu xe
- `refreshCarsData(userId)` - Refresh dữ liệu
- `deleteCar(licensePlate)` - Xóa xe
- `updateCarStatus(licensePlate, newStatus)` - Cập nhật trạng thái xe
- `addCar(newCar)` - Thêm xe mới
- `updateCar(updatedCar)` - Cập nhật thông tin xe

## Hooks đã tạo

### 1. useRentalHistoryRefresh (`frontend/src/hooks/useRentalHistoryRefresh.js`)
- Hook để refresh dữ liệu lịch sử thuê xe

### 2. useCarManagementRefresh (`frontend/src/hooks/useCarManagementRefresh.js`)
- Hook để refresh dữ liệu quản lý xe

## Components đã cập nhật

### 1. RentalHistoryPage.js
- Sử dụng `useRentalHistory` hook thay vì gọi API trực tiếp
- Tự động cache dữ liệu trong 5 phút
- Cập nhật trạng thái thuê xe thông qua context

### 2. CarManagementPage.js
- Sử dụng `useCarManagement` hook thay vì gọi API trực tiếp
- Tự động cache dữ liệu trong 5 phút
- Quản lý CRUD xe thông qua context

## Cách sử dụng

### Trong component:

```javascript
import { useRentalHistory } from '../../contexts/RentalHistoryContext';
import { useCarManagement } from '../../contexts/CarManagementContext';

const MyComponent = () => {
  const { rentalsData, loading, error, fetchRentalsData } = useRentalHistory();
  const { carsData, loading: carsLoading, fetchCarsData } = useCarManagement();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      fetchRentalsData(user.userId);
      fetchCarsData(user.userId);
    }
  }, [fetchRentalsData, fetchCarsData]);

  // Sử dụng dữ liệu từ context
  return (
    <div>
      {loading ? <div>Loading...</div> : (
        <div>
          {rentalsData.map(rental => (
            <div key={rental.id}>{rental.car.brand}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Refresh dữ liệu:

```javascript
import { useRentalHistoryRefresh } from '../../hooks/useRentalHistoryRefresh';

const MyComponent = () => {
  const { refreshData } = useRentalHistoryRefresh();
  
  const handleRefresh = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      await refreshData(user.userId);
    }
  };

  return <button onClick={handleRefresh}>Refresh</button>;
};
```

## Lợi ích

1. **Giảm API requests**: Dữ liệu được cache trong 5 phút, không cần gọi API mỗi lần chuyển tab
2. **Tăng performance**: Dữ liệu được load một lần và tái sử dụng
3. **State management tốt hơn**: Tự động cập nhật UI khi có thay đổi
4. **Code sạch hơn**: Tách biệt logic data fetching khỏi components
5. **Consistency**: Dữ liệu đồng nhất giữa các components

## Cache Strategy

- **Cache timeout**: 5 phút
- **Force refresh**: Có thể force refresh khi cần thiết
- **Auto refresh**: Tự động refresh khi cache hết hạn
- **Optimistic updates**: Cập nhật UI ngay lập tức khi có thay đổi

## Provider Setup

Các Provider đã được thêm vào `App.js`:

```javascript
<CarDataProvider>
  <RentalHistoryProvider>
    <CarManagementProvider>
      <Routes>
        {/* Routes */}
      </Routes>
    </CarManagementProvider>
  </RentalHistoryProvider>
</CarDataProvider>
``` 