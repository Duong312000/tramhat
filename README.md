# 🌱 TRẠM HẠT® - KIẾN TRÚC HỆ THỐNG 3 TẦNG (ZERO DOCKER)

Dự án đã được tái cấu trúc thành 3 thành phần độc lập, chuyên nghiệp và chuẩn kiến trúc doanh nghiệp:

```
web/
├── 🌐 frontend/              # THƯ MỤC 1: Giao diện người dùng & Khách hàng
│   ├── index.html            # Cửa hàng thương mại điện tử Trạm Hạt
│   ├── campaign_media_tramhat.html # Landing page Chiến dịch truyền thông xanh
│   ├── media_portal_tramhat.html   # Cổng thông tin & Tư liệu báo chí
│   ├── js/
│   │   └── api.js            # Automated Marketing Tracker SDK & REST Client
│   ├── data/                 # Dữ liệu dự phòng offline
│   ├── images/               # Thư mục hình ảnh & logo thương hiệu
│   └── package.json          # Quản lý chạy Frontend độc lập (Port 3000)
│
├── ⚙️ backend/               # THƯ MỤC 2: REST API Server (Node.js & Express)
│   ├── src/
│   │   ├── config/db.js      # Kết nối MongoDB Database Server
│   │   ├── models/           # Mongoose Schemas (Product, Order, Lead, TrackingEvent,...)
│   │   ├── controllers/      # Bộ xử lý CRUD, Funnel 5 tầng & KPI Scorecard 100 điểm
│   │   ├── routes/api.js     # Danh sách toàn bộ REST API endpoints
│   │   ├── seeds/seed.js     # Script nạp dữ liệu mẫu vào Database
│   │   └── server.js         # Entry point máy chủ Express (Port 5000)
│   ├── .env                  # Biến môi trường kết nối Database
│   └── package.json
│
├── 🍃 database/              # THÀNH PHẦN 3: Database Server độc lập (KHÔNG CẦN DOCKER)
│   ├── server.js             # Khởi chạy MongoDB Server Native độc lập (Port 27017)
│   ├── storage/              # Thư mục lưu trữ dữ liệu bền vững trên ổ cứng
│   ├── seeds/data/           # Dữ liệu JSON gốc (products, orders, users, reviews,...)
│   ├── package.json          # Quản lý khởi động Database Server
│   └── README.md             # Hướng dẫn chi tiết Database Server
│
├── package.json              # Quản lý script khởi chạy toàn bộ hệ thống
└── README.md                 # Tài liệu này
```

---

## ⚡ Hướng Dẫn Khởi Chạy 3 Tầng Độc Lập

### 1. Khởi động Máy chủ Cơ sở dữ liệu (Database Server - Port 27017)
Mở một cửa sổ dòng lệnh riêng:
```bash
npm run start:database
# hoặc:
cd database && npm start
```
* **Host:** `mongodb://127.0.0.1:27017/tramhat_db`
* **Dữ liệu lưu tại:** `database/storage/` (Lưu bền vững trên ổ cứng).
* 🚫 **Không cần bật hoặc cài đặt Docker.**

### 2. Nạp dữ liệu ban đầu vào Database (Seed Data)
```bash
npm run seed
```

### 3. Khởi chạy Backend Server (Port 5000)
Mở cửa sổ dòng lệnh thứ hai:
```bash
npm run dev:backend
```
- API Base: `http://localhost:5000/api/all`
- Phễu chuyển đổi 5 tầng: `http://localhost:5000/api/analytics/funnel`
- Bảng điểm 100 điểm KPI: `http://localhost:5000/api/analytics/scorecard`

### 4. Khởi chạy Frontend (Port 3000)
Mở cửa sổ dòng lệnh thứ ba:
```bash
npm run start:frontend
```
Truy cập: [http://localhost:3000](http://localhost:3000)
