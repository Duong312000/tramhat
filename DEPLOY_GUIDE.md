# 🌐 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG TRẠM HẠT CHẠY 24/7 MIỄN PHÍ TRÊN CLOUD

Hệ thống được thiết kế theo chuẩn **Kiến trúc 3 tầng (3-Tier)** độc lập:
* **Database:** MongoDB Atlas Cloud (Miễn phí trọn đời, chính chủ MongoDB)
* **Backend:** Render.com (Máy chủ Node.js REST API chạy 24/7 miễn phí)
* **Frontend:** Vercel (Mạng phân phối CDN toàn cầu, bảo mật SSL HTTPS miễn phí)

---

## 🍃 BƯỚC 1: TẠO DATABASE MONGODB ATLAS (3 Phút)

1. Truy cập: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) và đăng ký tài khoản miễn phí (bằng Google/GitHub).
2. Tạo cụm dữ liệu miễn phí:
   * Chọn gói **M0 Free (Shared)**.
   * Chọn nhà cung cấp: **AWS** hoặc **Google Cloud**, Region: **Singapore** (để tốc độ tải tại Việt Nam nhanh nhất).
   * Bấm **Create Deployment**.
3. Thiết lập bảo mật & người dùng:
   * **Username:** ví dụ `tramhat_admin`
   * **Password:** ví dụ `Tramhat2026@Secure` *(hãy lưu lại mật khẩu này)*
   * Bấm **Create Database User**.
4. Mở quyền truy cập mạng (Network Access):
   * Tại mục **IP Access List**, chọn **Allow Access from Anywhere** (IP: `0.0.0.0/0`).
   * Bấm **Add Entry**.
5. Lấy chuỗi kết nối (Connection String):
   * Bấm nút **Connect** -> Chọn **Drivers (Node.js)**.
   * Copy chuỗi kết nối có dạng:
     ```
     mongodb+srv://tramhat_admin:<password>@cluster0.xxxx.mongodb.net/tramhat_db?retryWrites=true&w=majority
     ```
   * Thay `<password>` bằng mật khẩu bạn đã tạo ở bước 3.

---

## ⚙️ BƯỚC 2: DEPLOY BACKEND LÊN RENDER.COM (3 Phút)

1. Đẩy mã nguồn dự án lên GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "Deploy Tram Hat 3-tier platform"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```
2. Truy cập: [https://render.com](https://render.com) và đăng nhập bằng tài khoản GitHub.
3. Bấm nút **New +** ở góc phải trên -> Chọn **Web Service**.
4. Chọn repository bạn vừa đẩy lên.
5. Cấu hình thông số:
   * **Name:** `tramhat-backend` (hoặc tên tùy thích)
   * **Region:** `Singapore (Southeast Asia)`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
6. Thêm biến môi trường (Environment Variables):
   * Click **Advanced** -> Bấm **Add Environment Variable**:
     * `MONGO_URI`: Dán chuỗi kết nối MongoDB Atlas từ Bước 1.
     * `NODE_ENV`: `production`
     * `CLIENT_ORIGIN`: `*`
7. Bấm **Deploy Web Service**.
   * Đợi khoảng 1-2 phút, Render sẽ cấp cho bạn một đường dẫn URL HTTPS công khai 24/7, ví dụ:
     👉 **`https://tramhat-backend.onrender.com`**
   * Bạn có thể kiểm tra sức khỏe server tại: `https://tramhat-backend.onrender.com/health`

---

## 🌐 BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL (2 Phút)

1. Mở file [frontend/js/config.js](file:///d:/hoc/cnmarketing/web/frontend/js/config.js) trên máy tính:
   * Cập nhật biến `CLOUD_BACKEND_API` thành link Backend Render của bạn:
     ```javascript
     const CLOUD_BACKEND_API = 'https://tramhat-backend.onrender.com/api';
     ```
   * Lưu file lại và commit lên GitHub:
     ```bash
     git add frontend/js/config.js
     git commit -m "Update production API URL"
     git push
     ```

2. Truy cập: [https://vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
3. Bấm **Add New...** -> Chọn **Project**.
4. Chọn repository dự án Trạm Hạt của bạn.
5. Cấu hình thư mục triển khai:
   * Tại mục **Root Directory**, bấm nút **Edit** và chọn thư mục: **`frontend`**
   * Framework Preset: Giữ nguyên `Other`
6. Bấm **Deploy**.
   * Chỉ mất khoảng 20 giây, Vercel sẽ cấp domain chính thức chạy 24/7 miễn phí:
     👉 **`https://tramhat.vercel.app`** (hoặc tên theo tài khoản của bạn).

---

## 🎯 KIỂM THỬ HỆ THỐNG SAU KHI DEPLOY XONG
1. Mở link Vercel trên điện thoại hoặc máy tính bất kỳ.
2. Thử đặt 1 đơn hàng (chọn vị sữa hạt, điền tên & địa chỉ).
3. Đơn hàng sẽ được gửi thẳng tới Backend trên Render và lưu vĩnh viễn vào MongoDB Atlas!
4. Mở link phân tích phễu chuyển đổi:
   `https://tramhat-backend.onrender.com/api/analytics/funnel`
5. Mở bảng điểm KPI 100 điểm:
   `https://tramhat-backend.onrender.com/api/analytics/scorecard`

Chúc mừng bạn! Dự án đã chính thức hoạt động online 24/7/365 trên toàn cầu!
