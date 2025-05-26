# CARRENTAL - Dự án Thuê Xe
<a href="https://www.facebook.com/ekanC">Liên hệ</a>
## Giới thiệu

Đây là dự án ứng dụng thuê xe (CARRENTAL), được phát triển với kiến trúc client-server sử dụng Spring Boot cho Backend và ReactJS cho Frontend.

Dự án bao gồm các chức năng cơ bản như đăng ký, đăng nhập, quản lý thông tin người dùng, và các tính năng quản trị (danh sách người dùng, cập nhật vai trò, xóa người dùng).

## Công nghệ sử dụng

**Backend:**
- Spring Boot
- Spring Security (cho xác thực và phân quyền)
- JPA / Hibernate (quản lý cơ sở dữ liệu)
- Maven (quản lý dependency)
- Cơ sở dữ liệu (ví dụ: MySQL, PostgreSQL, H2, v.v. - cần cấu hình cụ thể)

**Frontend:**
- ReactJS
- React Router DOM (quản lý định tuyến)
- Axios (gọi API backend)
- CSS (styling)
- npm / yarn (quản lý dependency)

## Hướng dẫn chạy dự án

Để chạy dự án này, bạn cần cài đặt các phần mềm sau trên máy tính của mình:

- **Java Development Kit (JDK)** (phiên bản 8 trở lên)
- **Maven** hoặc **Gradle** (tùy thuộc vào dự án Spring Boot được cấu hình sử dụng công cụ nào)
- **Node.js** và **npm** (hoặc **yarn**)
- Một hệ quản trị cơ sở dữ liệu và cấu hình kết nối trong file `application.properties` (hoặc `application.yml`) của backend.

### 1. Thiết lập Backend

1.  **Clone repository:**
    ```bash
    git clone <URL_cua_repository_backend>
    cd <thu_muc_backend>
    ```
    *(Thay `<URL_cua_repository_backend>` và `<thu_muc_backend>` bằng thông tin thực tế)*

2.  **Cấu hình cơ sở dữ liệu:**
    Mở file cấu hình của Spring Boot (thường là `src/main/resources/application.properties` hoặc `application.yml`) và cập nhật thông tin kết nối đến cơ sở dữ liệu của bạn (URL, username, password).

3.  **Build và chạy Backend:**
    Sử dụng Maven:
    ```bash
    mvn clean install
    mvn spring-boot:run
    ```
    Hoặc sử dụng Gradle (nếu dự án dùng Gradle):
    ```bash
    ./gradlew clean build
    ./gradlew bootRun
    ```
    Backend sẽ chạy mặc định trên cổng `8080`.

### 2. Thiết lập Frontend

1.  **Clone repository (nếu riêng):**
    ```bash
    git clone <URL_cua_repository_frontend>
    cd <thu_muc_frontend>
    ```
    *(Thay `<URL_cua_repository_frontend>` và `<thu_muc_frontend>` bằng thông tin thực tế)*
    *Nếu frontend và backend chung một repository, bạn chỉ cần `cd` vào thư mục frontend.*

2.  **Cài đặt Dependencies:**
    Sử dụng npm:
    ```bash
    npm install
    ```
    Hoặc sử dụng yarn:
    ```bash
    yarn install
    ```

3.  **Chạy Frontend:**
    Sử dụng npm:
    ```bash
    npm start
    ```
    Hoặc sử dụng yarn:
    ```bash
    yarn start
    ```
    Frontend sẽ chạy mặc định trên cổng `3000`.

Sau khi cả backend và frontend đều đang chạy, bạn có thể truy cập ứng dụng tại `http://localhost:3000` trên trình duyệt của mình.

## Cấu hình thêm

- **CORS:** File `AdminController.java` và có thể các controller khác cần có `@CrossOrigin(origins = "http://localhost:3000")` để cho phép frontend truy cập từ cổng 3000.
- **Bảo mật Admin:** Các endpoint admin (`/api/admin/**`) hiện đang tạm thời bỏ qua xác thực cho mục đích demo. Trong môi trường production, bạn cần bật lại `@PreAuthorize("hasRole('ADMIN')")` trong `AdminController.java` và cấu hình Spring Security để bảo vệ các endpoint này bằng token (JWT) và kiểm tra vai trò người dùng.
- **Variables Môi trường:** Cân nhắc sử dụng biến môi trường cho các thông tin nhạy cảm như thông tin cơ sở dữ liệu, khóa API, v.v.

## Đóng góp

Nếu bạn muốn đóng góp cho dự án, vui lòng tạo một pull request hoặc mở một issue để thảo luận.

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

---
