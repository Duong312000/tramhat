# 🍃 TRẠM HẠT® - DATABASE SERVER (MONGODB NATIVE - KHÔNG DÙNG DOCKER)

Thư mục quản lý và khởi chạy **Máy chủ Cơ Sở Dữ Liệu độc lập (Database Server)** cho toàn bộ hệ thống Trạm Hạt.

> 🚫 **100% Không cần Docker**: Chạy native trực tiếp thông qua Node.js trên Windows/macOS/Linux.

---

## 🚀 1. Cách khởi động Database Server độc lập

Mở một cửa sổ dòng lệnh riêng cho Database và chạy:

```bash
# Cách 1: Từ thư mục gốc dự án
npm run start:database

# Cách 2: Hoặc di chuyển thẳng vào thư mục database
cd database
npm start
```

### Thông số kết nối:
* **Host / Cổng:** `mongodb://127.0.0.1:27017`
* **Database Name:** `tramhat_db`
* **Vị trí lưu trữ dữ liệu bền vững:** `database/storage/` (Toàn bộ dữ liệu được lưu vĩnh viễn trên ổ cứng, không bị mất khi tắt server).

---

## 🌱 2. Nạp dữ liệu ban đầu vào Database Server (Seed Data)

Toàn bộ dữ liệu gốc được lưu trong `database/seeds/data/`:
* `products.json`: Danh mục 6 vị sữa hạt chuẩn.
* `orders.json`: Lịch sử đơn hàng và nguồn UTM.
* `users.json`: Tài khoản khách hàng & quản trị viên.
* `reviews.json`: Đánh giá phản hồi khách hàng.
* `articles.json`: Bài viết cẩm nang sức khỏe.
* `analytics.json`: Số liệu phân tích ban đầu.
* `content.json`: Cấu hình nội dung website.

Để nạp lại dữ liệu:
```bash
npm run seed
```
