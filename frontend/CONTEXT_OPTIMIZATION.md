# Context Optimization for Rental History, Car Management, Partner Data, and User Management

## Tổng quan

Đã thêm 4 context để tối ưu hóa việc quản lý dữ liệu và giảm số lượng API requests:

1. **RentalHistoryContext** - Quản lý dữ liệu lịch sử thuê xe
2. **CarManagementContext** - Quản lý dữ liệu xe của chủ sở hữu
3. **PartnerDataContext** - Quản lý dữ liệu partner cho admin
4. **UserDataContext** - Quản lý dữ liệu user cho admin

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

### 3. PartnerDataContext (`frontend/src/contexts/PartnerDataContext.js`)

**Chức năng:**
- Lưu trữ dữ liệu partner cho admin với cache 5 phút
- Cung cấp các hàm để fetch, refresh và cập nhật dữ liệu partner
- Tự động cập nhật state khi có thay đổi

**API:**
- `fetchPartnersData(forceRefresh)` - Lấy dữ liệu partner
- `refreshPartnersData()` - Refresh dữ liệu
- `updatePartnerStatus(id, newStatus)` - Cập nhật trạng thái partner
- `getPartnerById(id)` - Lấy partner theo ID
- `getPartnersByFilter(filterFn)` - Lọc dữ liệu theo điều kiện

### 4. UserDataContext (`frontend/src/contexts/UserDataContext.js`)

**Chức năng:**
- Lưu trữ dữ liệu user cho admin với cache 5 phút
- Cung cấp các hàm để fetch, refresh và cập nhật dữ liệu user
- Tự động cập nhật state khi có thay đổi

**API:**
- `fetchUsersData(forceRefresh)` - Lấy dữ liệu user
- `refreshUsersData()` - Refresh dữ liệu
- `updateUserRole(userId, newRole)` - Cập nhật vai trò user
- `updateUserStatus(userId, newStatus)` - Cập nhật trạng thái user
- `deleteUser(userId)` - Xóa user
- `getUserById(userId)` - Lấy user theo ID
- `getUsersByFilter(filterFn)` - Lọc dữ liệu theo điều kiện

## Hooks đã tạo

### 1. useRentalHistoryRefresh (`frontend/src/hooks/useRentalHistoryRefresh.js`)
- Hook để refresh dữ liệu lịch sử thuê xe

### 2. useCarManagementRefresh (`frontend/src/hooks/useCarManagementRefresh.js`)
- Hook để refresh dữ liệu quản lý xe

### 3. usePartnerDataRefresh (`frontend/src/hooks/usePartnerDataRefresh.js`)
- Hook để refresh dữ liệu partner

### 4. useUserDataRefresh (`frontend/src/hooks/useUserDataRefresh.js`)
- Hook để refresh dữ liệu user

## Components đã cập nhật

### 1. RentalHistoryPage.js
- Sử dụng RentalHistoryContext thay vì gọi API trực tiếp
- Tự động refresh dữ liệu khi cần thiết

### 2. CarManagementPage.js
- Sử dụng CarManagementContext thay vì gọi API trực tiếp
- Tự động cập nhật UI khi có thay đổi

### 3. PartnerPage.js
- Sử dụng PartnerDataContext thay vì gọi API trực tiếp
- Tự động cập nhật UI khi có thay đổi trạng thái partner

### 4. UserManagementPage.js
- Sử dụng UserDataContext thay vì gọi API trực tiếp
- Tự động cập nhật UI khi có thay đổi vai trò hoặc trạng thái user

## Cách sử dụng

### 1. Sử dụng UserDataContext trong component

```javascript
import { useUserData } from '../../contexts/UserDataContext';

const MyComponent = () => {
  const { 
    usersData, 
    loading, 
    error, 
    fetchUsersData,
    refreshUsersData,
    updateUserRole,
    updateUserStatus,
    deleteUser 
  } = useUserData();

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      // UI sẽ tự động cập nhật
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      // UI sẽ tự động cập nhật
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteUser(userId);
        // UI sẽ tự động cập nhật
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {usersData.map(user => (
        <div key={user.userId}>{user.fullName}</div>
      ))}
    </div>
  );
};
```

### 2. Sử dụng hook refresh

```javascript
import { useUserDataRefresh } from '../../hooks/useUserDataRefresh';

const MyComponent = () => {
  const { fetchUsersData } = useUserDataRefresh();
  
  // Hook sẽ tự động refresh dữ liệu khi cần thiết
  // Bạn có thể gọi fetchUsersData(true) để force refresh
};
```

## Lợi ích

1. **Giảm API calls**: Dữ liệu được cache trong 5 phút, tránh gọi API không cần thiết
2. **Cải thiện UX**: UI cập nhật ngay lập tức khi có thay đổi
3. **Tối ưu hiệu suất**: Chỉ fetch dữ liệu khi thực sự cần thiết
4. **Dễ bảo trì**: Logic quản lý dữ liệu tập trung trong context
5. **Tái sử dụng**: Có thể sử dụng dữ liệu ở nhiều component khác nhau

## Cache Strategy

- **Cache timeout**: 5 phút cho tất cả context
- **Force refresh**: Có thể force refresh khi cần dữ liệu mới nhất
- **Auto refresh**: Tự động refresh khi cache hết hạn
- **Optimistic updates**: UI cập nhật ngay lập tức, không cần chờ API response

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