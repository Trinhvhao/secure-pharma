# ✅ PHASE 1 - PROJECT FOUNDATION CHECKLIST

> Trạng thái: **HOÀN THÀNH**
> Ngày: 15/09/2026

Theo [`IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) mục **9. Phase 1 – Project Foundation**

> **Mục tiêu Phase 1:** BE đọc/ghi được SQL Server, FE gọi được API và nhận response.

---

## 📋 Checklist theo từng Layer

### 🔵 Backend (Node.js + Express)

| # | Task | Trạng thái | File |
|:-:|---|:-:|---|
| 1 | Khởi tạo Node.js project | ✅ | `backend/package.json` |
| 2 | Cài đặt dependencies (express, mssql, cors, helmet, xss, dotenv) | ✅ | `backend/package.json` |
| 3 | Cấu hình `.env` (DB, JWT, AES) | ✅ | `backend/.env` |
| 4 | Module kết nối SQL Server (pool mssql) | ✅ | `backend/src/config/db.js` |
| 5 | Utility format response (success/error) | ✅ | `backend/src/utils/response.js` |
| 6 | Utility logger (winston) | ✅ | `backend/src/utils/logger.js` |
| 7 | Middleware errorHandler (404 + 500) | ✅ | `backend/src/middleware/errorHandler.js` |
| 8 | Express app + CORS + Helmet + Body parser | ✅ | `backend/src/app.js` |
| 9 | Endpoint `/api/health` | ✅ | `backend/src/app.js` |
| 10 | Server entry point (graceful shutdown) | ✅ | `backend/src/server.js` |
| 11 | XSS middleware (sẵn sàng cho Phase 2) | ✅ | `backend/src/app.js` |
| 12 | Seed accounts script (sẵn sàng cho Phase 2) | ✅ | `backend/src/scripts/migrate.js` (seedAccounts) |

### 🟢 Frontend (React + Vite + Tailwind)

| # | Task | Trạng thái | File |
|:-:|---|:-:|---|
| 1 | Khởi tạo Vite + React project | ✅ | `frontend/package.json` |
| 2 | Cài đặt dependencies (react, router, axios, tailwind, lucide-react) | ✅ | `frontend/package.json` |
| 3 | Vite config với proxy `/api` → `localhost:8080` | ✅ | `frontend/vite.config.js` |
| 4 | Tailwind config (primary color palette) | ✅ | `frontend/tailwind.config.js` |
| 5 | PostCSS config | ✅ | `frontend/postcss.config.js` |
| 6 | `index.html` entry | ✅ | `frontend/index.html` |
| 7 | Global CSS với Tailwind directives | ✅ | `frontend/src/index.css` |
| 8 | Entry point `main.jsx` | ✅ | `frontend/src/main.jsx` |
| 9 | Axios instance + interceptors (sẵn sàng cho Phase 2) | ✅ | `frontend/src/services/api.js` |
| 10 | App.jsx với BrowserRouter + Routes | ✅ | `frontend/src/App.jsx` |
| 11 | DashboardPage đơn giản test API | ✅ | `frontend/src/pages/dashboard/DashboardPage.jsx` |

### 🟣 Database (SQL Server 2019)

| # | Task | Trạng thái | File |
|:-:|---|:-:|---|
| 1 | Script tạo 12 bảng (có FK + Index + CHECK constraint) | ✅ | `backend/database/01_create_tables.sql` |
| 2 | Script seed data (DM, NCC, NV, Thuốc, KH) | ✅ | `backend/database/02_seed_data.sql` |

**12 bảng đã tạo:**
1. `DanhMuc` - Danh mục thuốc
2. `NhaCungCap` - Nhà cung cấp
3. `KhachHang` - Khách hàng
4. `NhanVien` - Nhân viên
5. `TaiKhoan` - Tài khoản đăng nhập
6. `Thuoc` - Thuốc
7. `PhieuNhap` - Phiếu nhập
8. `LoThuoc_ChiTietNhap` - Chi tiết lô thuốc
9. `HoaDon` - Hóa đơn bán
10. `ChiTietHoaDon` - Chi tiết hóa đơn
11. `PhieuChi` - Phiếu chi
12. `AuditLog` - Nhật ký thao tác

### 📚 Documentation

| # | File | Trạng thái |
|:-:|---|:-:|
| 1 | `README.md` - Tổng quan dự án | ✅ |
| 2 | `docs/INSTALL.md` - Hướng dẫn cài đặt chi tiết | ✅ |
| 3 | `docs/archive/PHASE1_CHECKLIST.md` - File này | ✅ |

---

## 🎯 Done Criteria (theo IMPLEMENTATION_PLAN.md mục 9.4)

| # | Tiêu chí | Trạng thái |
|:-:|---|:-:|
| 1 | `npm run dev` (backend) → `http://localhost:8080/api/health` trả `{status:"ok"}` | ✅ |
| 2 | `npm run dev` (frontend) → `http://localhost:5173` hiển thị trang Phase 1 | ✅ |
| 3 | Kết nối SQL Server thành công (12 bảng tồn tại) | ✅ |
| 4 | FE gọi `/api/health` từ axios → nhận được response | ✅ |
| 5 | Tailwind/CSS đã apply (button có style primary) | ✅ |

**Cách verify:** Mở `http://localhost:5173` → Click **"Test API Connection"** → Thấy status: ok ✅

---

## 📦 Cấu trúc file đã tạo

```
SecurePharma/
├── README.md                              ✅ Tổng quan
├── docs/INSTALL.md                             ✅ Hướng dẫn cài đặt
├── docs/archive/PHASE1_CHECKLIST.md            ✅ File này
├── docs/FEATURES.md                            (đã có sẵn - đề bài)
├── docs/IMPLEMENTATION_PLAN.md                 (đã có sẵn - kế hoạch)
│
├── backend/
│   ├── package.json                       ✅
│   ├── .env                               ✅
│   ├── src/
│   │   ├── server.js                      ✅ Entry point
│   │   ├── app.js                         ✅ Express app
│   │   ├── scripts/
│   │   │   └── migrate.js                   ✅ Migrate + seed accounts
│   │   ├── config/
│   │   │   └── db.js                      ✅ Kết nối SQL Server
│   │   ├── middleware/
│   │   │   ├── errorHandler.js            ✅ Phase 1
│   │   │   ├── auth.js                    ✅ Phase 2 (chưa wire)
│   │   │   ├── rbac.js                    ✅ Phase 2 (chưa wire)
│   │   │   └── audit.js                   ✅ Phase 2 (chưa wire)
│   │   ├── modules/
│   │   │   └── auth/                      ✅ Phase 2 (chưa wire)
│   │   │       ├── auth.controller.js
│   │   │       ├── auth.service.js
│   │   │       └── auth.routes.js
│   │   └── utils/
│   │       ├── response.js                ✅
│   │       └── logger.js                  ✅
│   └── database/
│       ├── 01_create_tables.sql           ✅
│       └── 02_seed_data.sql               ✅
│
└── frontend/
    ├── package.json                       ✅
    ├── vite.config.js                     ✅
    ├── tailwind.config.js                 ✅
    ├── postcss.config.js                  ✅
    ├── index.html                         ✅
    └── src/
        ├── main.jsx                       ✅
        ├── App.jsx                        ✅ Phase 1 (đơn giản)
        ├── index.css                      ✅
        ├── services/
        │   ├── api.js                     ✅ Phase 1
        │   └── authService.js             ✅ Phase 2 (chưa wire)
        ├── contexts/
        │   └── AuthContext.jsx            ✅ Phase 2 (chưa wire)
        ├── router/
        │   └── ProtectedRoute.jsx         ✅ Phase 2 (chưa wire)
        ├── components/
        │   └── layout/                    ✅ Phase 2 (chưa wire)
        │       ├── MainLayout.jsx
        │       ├── Header.jsx
        │       └── Sidebar.jsx
        ├── pages/
        │   ├── auth/LoginPage.jsx         ✅ Phase 2 (chưa wire)
        │   └── dashboard/DashboardPage.jsx ✅ Phase 1 (đơn giản)
        └── utils/
            ├── format.js                  ✅
            └── constants.js               ✅ Phase 2 (chưa wire)
```

---

## 🚀 Bước tiếp theo: Phase 2 - Authentication & RBAC

Sẽ triển khai:
1. Wire auth routes vào `app.js`: `app.use('/api/auth', require('./modules/auth/auth.routes'))`
2. Wire AuthProvider vào `App.jsx`
3. Wire ProtectedRoute cho các routes cần auth
4. Tạo LoginPage UI hoàn chỉnh
5. Chạy `npm run seed` để tạo 3 tài khoản demo (admin, nv1, nv2)
6. Test: login admin → vào dashboard, NV cố truy cập `/nhan-vien` → 403

Xem chi tiết: [`IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) mục 10.
