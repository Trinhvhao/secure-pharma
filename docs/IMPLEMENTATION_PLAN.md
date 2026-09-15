# 🚀 KẾ HOẠCH TRIỂN KHAI DỰ ÁN SECUREPHARMA

> **Đề tài:** Xây dựng website quản lý cửa hàng dược phẩm có tích hợp giải pháp an toàn
> **Ngành:** An toàn thông tin
> **Tech Stack:** Node.js (Express) + React.js + SQL Server 2019 + REST API
> **Quy mô:** Đồ án / Project sinh viên

---

## 📋 MỤC LỤC

1. [Tổng quan & Phân tích](#1-tổng-quan--phân-tích)
2. [Phân loại MUST / SHOULD / NICE TO HAVE](#2-phân-loại-must--should--nice-to-have)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Database Schema](#4-database-schema)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Roadmap triển khai theo Phase](#7-roadmap-triển-khai-theo-phase)
8. [Phase 0 – Phân tích & Thiết kế](#8-phase-0--phân-tích--thiết-kế)
9. [Phase 1 – Project Foundation](#9-phase-1--project-foundation)
10. [Phase 2 – Authentication & User Management](#10-phase-2--authentication--user-management)
11. [Phase 3 – Core Business Features](#11-phase-3--core-business-features)
12. [Phase 4 – Security](#12-phase-4--security)
13. [Phase 5 – Integration & Testing](#13-phase-5--integration--testing)
14. [Phase 6 – Hoàn thiện đồ án](#14-phase-6--hoàn-thiện-đồ-án)
15. [Thứ tự code cụ thể để team bắt đầu](#15-thứ-tự-code-cụ-thể-để-team-bắt-đầu)
16. [Lưu ý quan trọng](#16-lưu-ý-quan-trọng)

---

## 1. TỔNG QUAN & PHÂN TÍCH

### 1.1. Mục tiêu chính của hệ thống

| # | Mục tiêu | Ghi chú |
|:-:|---|---|
| 1 | Số hóa toàn bộ quy trình hiệu thuốc | Nhập, bán, tồn kho, tài chính, nhân sự |
| 2 | Quản lý lô thuốc + hạn sử dụng | Đặc thù ngành dược |
| 3 | Tích hợp giải pháp an toàn | RBAC, mã hóa, chống SQLi/XSS |
| 4 | Báo cáo thống kê phục vụ quản lý | Kho, hóa đơn, tài chính |

### 1.2. Actor / User Role

| Actor | Mô tả | Quyền |
|---|---|---|
| **Quản lý (Admin)** | Chủ hiệu thuốc | Toàn quyền: quản lý nhân viên, tài chính, thống kê, cấu hình |
| **Nhân viên bán thuốc (NV_BanHang)** | Dược sĩ bán lẻ | Bán thuốc, tìm kiếm, tạo phiếu thu, xem thống kê được phép |
| **Thủ kho (NV_Kho)** | Nhân viên quản lý kho | Nhập thuốc, quản lý lô/hạn SD, thống kê tồn kho |

### 1.3. Module nghiệp vụ chính

| Module | Chức năng | Mục báo cáo |
|---|---|---|
| **Auth** | Đăng nhập, Đăng xuất | 2.1.1.1, 2.1.1.2 |
| **Thuốc & Danh mục** | Tìm kiếm thuốc, CRUD | 2.1.1.3 |
| **Bán hàng** | Bán thuốc (FIFO lô) | 2.1.1.4 |
| **Kho / Nhập** | Nhập thuốc (phiếu nhập + lô) | 2.1.1.5 |
| **Tài chính** | Tạo phiếu chi | 2.1.1.6 |
| **Nhân viên** | CRUD nhân viên | 2.1.1.7 |
| **Thống kê** | Thống kê kho, hóa đơn, tài chính | 2.1.1.8 → 2.1.1.10 |

### 1.4. Mapping báo cáo ↔ FEATURES.md

| Chức năng | Báo cáo | FEATURES.md | Mức |
|---|:-:|:-:|---|
| Đăng nhập | ✅ | ✅ | MUST |
| Đăng xuất | ✅ | ✅ | MUST |
| Đổi mật khẩu | ❌ | ✅ | SHOULD |
| Quên mật khẩu | ❌ | ✅ | NICE |
| MFA TOTP | ❌ | ✅ | NICE |
| Refresh Token | ❌ | ✅ | SHOULD |
| Tìm kiếm thuốc | ✅ | ✅ | MUST |
| CRUD Thuốc | Ngụ ý | ✅ | MUST |
| CRUD Danh mục | Ngụ ý | ✅ | MUST |
| Nhập thuốc (phiếu nhập) | ✅ | ✅ | MUST |
| Quản lý lô + hạn SD | Ngụ ý | ✅ | MUST |
| Bán thuốc | ✅ | ✅ | MUST |
| Kiểm tra tồn kho | Ngụ ý | ✅ | MUST |
| Hủy hóa đơn | Có sequence diagram | ✅ | SHOULD |
| CRUD Khách hàng | Ngụ ý | ✅ | MUST |
| CRUD Nhà cung cấp | Ngụ ý | ✅ | MUST |
| CRUD Nhân viên | ✅ | ✅ | MUST |
| Phân quyền tài khoản | ✅ | ✅ | MUST |
| Tạo phiếu chi | ✅ | ✅ | MUST |
| Tạo phiếu thu | Có sequence | ✅ | SHOULD |
| Thống kê kho | ✅ | ✅ | MUST |
| Thống kê hóa đơn | ✅ | ✅ | MUST |
| Thống kê tài chính | ✅ | ✅ | MUST |
| Audit log | Ngụ ý (mục 1.7) | ✅ | SHOULD |
| Xuất báo cáo Excel/PDF | ❌ | ✅ | NICE |
| CSRF token | ❌ | ✅ | NICE |
| Rate limit | ❌ | ✅ | NICE |
| Role NV_Kho (Thủ kho) | ❌ (chỉ 2 role) | ✅ | NICE |
| Bảng RBAC tách | ❌ | ✅ | NICE |

### 1.5. Những điểm chưa rõ / xung đột

| Vấn đề | Phân tích | Quyết định |
|---|---|---|
| Mục 2.1.1.8 (Thống kê kho) & 2.1.1.9 (Thống kê hóa đơn) có nội dung giống hệt | Có thể lỗi đánh số/sao chép | TK kho = tồn kho + cảnh báo; TK hóa đơn = doanh thu + top thuốc |
| Vai trò trong báo cáo: "Nhân viên bán thuốc" và "Quản lý" | Rõ ràng 2 role | Chốt 2 role theo báo cáo |
| Bảng `KhachHang` không có trong ERD mục 2.5 nhưng có trong bảng mô tả | Bị bỏ sót ERD | Giữ bảng (logic nghiệp vụ cần) |

---

## 2. PHÂN LOẠI MUST / SHOULD / NICE TO HAVE

### 🔴 MUST HAVE (Bắt buộc theo báo cáo)

**Nghiệp vụ:**
- Đăng nhập / Đăng xuất
- 2 role: Admin + NV_BanHang
- Tìm kiếm thuốc
- Bán thuốc (có FIFO lô)
- Nhập thuốc (có quản lý lô + hạn SD)
- Tạo phiếu chi
- Quản lý nhân viên (CRUD)
- Thống kê kho (cảnh báo hết hàng/hết hạn)
- Thống kê hóa đơn
- Thống kê tài chính
- CRUD Thuốc + Danh mục + NCC + Khách hàng

**Bảo mật (theo mục 3.3 báo cáo):**
- RBAC (phân quyền)
- Bcrypt hash mật khẩu
- Parameterized query (chống SQL Injection)
- Escape XSS

### 🟡 SHOULD HAVE (Nên có nếu có thời gian)

- Đổi mật khẩu
- JWT + Refresh Token
- Mã hóa AES SDT Khách hàng/NV
- Hủy hóa đơn
- Biểu đồ thống kê (Recharts/Chart.js)
- In/Xem chi tiết hóa đơn
- Phiếu thu
- Audit log cơ bản

### 🟢 NICE TO HAVE (Không ảnh hưởng demo, có thì tốt)

- MFA TOTP cho Admin
- CSRF token
- Rate-limit login
- Role NV_Kho (Thủ kho)
- Tách bảng RBAC (`Quyen`, `VaiTro_Quyen`)
- Xuất Excel/PDF
- Quên mật khẩu qua email
- Helmet, HTTPS local

---

## 3. KIẾN TRÚC HỆ THỐNG

```
┌─────────────────┐       HTTPS (JWT)        ┌─────────────────┐       TDS       ┌─────────────────┐
│  React Frontend │  ─────────────────────▶  │  Node.js + Exp  │  ────────────▶  │  SQL Server     │
│  (Vite + React) │   REST API (JSON)        │  (Express)      │   mssql/tedious │  2019           │
└─────────────────┘                          └─────────────────┘                 └─────────────────┘
        │                                              │
        │ localStorage: token                          │ bcrypt, AES, JWT, xss
        ▼                                              ▼
  [role-based UI]                              [middleware chain]
```

### 3.1. Backend Flow

```
Client Request
   │
   ▼
Route (/api/...)              ← Định nghĩa URL + method
   │
   ▼
Middleware                    ← auth, rbac, validate, errorHandler
   │
   ▼
Controller (req, res)         ← Nhận input, gọi Service, trả response
   │
   ▼
Service                       ← Business logic, transaction
   │
   ▼
Repository                    ← SQL query (parameterized)
   │
   ▼
SQL Server                    ← Lưu trữ
```

| Layer | Trách nhiệm |
|---|---|
| **Route** | Map URL → Controller |
| **Middleware** | Xác thực JWT, kiểm tra role, validate input, xử lý lỗi |
| **Controller** | Parse `req.body`/`req.params`, gọi Service, format response |
| **Service** | Business logic: tính tiền, FIFO lô, check tồn kho, transaction |
| **Repository** | SQL thuần (parameterized), không chứa logic nghiệp vụ |

### 3.2. Frontend Flow

```
src/
├── pages/          ← Mỗi trang (route)
├── components/     ← Component dùng chung (Button, Table, Modal)
├── layouts/        ← MainLayout (sidebar + header)
├── services/       ← axios gọi API
├── contexts/       ← AuthContext (user, token, role)
├── hooks/          ← useAuth, useFetch
├── utils/          ← format tiền, format ngày
└── router/         ← Routes config + ProtectedRoute
```

### 3.3. Authentication & Authorization Flow

**Auth Flow:**
1. User gửi `username` + `password`
2. Backend tìm `TaiKhoan` → so sánh `bcrypt.compare(password, MatKhauHash)`
3. Nếu đúng → tạo JWT (chứa `sub`, `role`, `maNV`, `exp`) → trả về FE
4. FE lưu token vào `localStorage`
5. Mỗi request FE gửi kèm `Authorization: Bearer <token>`

**Authorization Flow:**
1. Middleware `auth` verify JWT → gắn `req.user`
2. Middleware `rbac(['Admin', 'NV_BanHang'])` kiểm tra role
3. Controller xử lý

### 3.4. Quy ước Response/Error

**Success:**
```json
{ "success": true, "data": { ... }, "message": "Thành công" }
```

**Error:**
```json
{ "success": false, "error": { "code": "AUTH_001", "message": "Sai tài khoản hoặc mật khẩu" } }
```

| HTTP Code | Ý nghĩa |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation lỗi |
| 401 | Chưa đăng nhập / Token sai |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy |
| 409 | Xung đột (vd: tồn kho không đủ) |
| 500 | Lỗi server |

---

## 4. DATABASE SCHEMA

### 4.1. Danh sách bảng (12 bảng)

| # | Bảng | Mục đích | Mức |
|:-:|---|---|---|
| 1 | `DanhMuc` | Nhóm thuốc | MUST |
| 2 | `NhaCungCap` | Nhà cung cấp | MUST |
| 3 | `KhachHang` | Khách hàng | MUST |
| 4 | `NhanVien` | Nhân viên | MUST |
| 5 | `TaiKhoan` | Tài khoản đăng nhập | MUST |
| 6 | `Thuoc` | Thuốc | MUST |
| 7 | `PhieuNhap` | Phiếu nhập | MUST |
| 8 | `LoThuoc_ChiTietNhap` | Chi tiết lô thuốc | MUST |
| 9 | `HoaDon` | Hóa đơn bán | MUST |
| 10 | `ChiTietHoaDon` | Chi tiết hóa đơn | MUST |
| 11 | `PhieuChi` | Phiếu chi | MUST |
| 12 | `AuditLog` | Nhật ký thao tác | SHOULD |

### 4.2. Script SQL tạo database

```sql
-- ============================================================
-- SECUREPHARMA DATABASE - Microsoft SQL Server 2019
-- ============================================================
CREATE DATABASE SecurePharmaDB;
GO
USE SecurePharmaDB;
GO

-- 1. BẢNG DANH MỤC THUỐC
CREATE TABLE DanhMuc (
    MaDM VARCHAR(20) PRIMARY KEY,
    TenDM NVARCHAR(200) NOT NULL UNIQUE,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 2. BẢNG NHÀ CUNG CẤP
CREATE TABLE NhaCungCap (
    MaNCC INT IDENTITY(1,1) PRIMARY KEY,
    TenNCC NVARCHAR(400) NOT NULL,
    DiaChi NVARCHAR(1000),
    SDT VARCHAR(15),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 3. BẢNG KHÁCH HÀNG
CREATE TABLE KhachHang (
    MaKH INT IDENTITY(1,1) PRIMARY KEY,
    TenKH NVARCHAR(200) NOT NULL,
    SDT VARCHAR(15),
    GioiTinh NVARCHAR(20),
    NgayTao DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 4. BẢNG NHÂN VIÊN
CREATE TABLE NhanVien (
    MaNV INT IDENTITY(1,1) PRIMARY KEY,
    TenNV NVARCHAR(200) NOT NULL,
    SDT VARCHAR(15),
    GioiTinh NVARCHAR(20),
    Luong DECIMAL(18,2),
    NgayVaoLam DATE DEFAULT GETDATE(),
    TrangThai NVARCHAR(50) DEFAULT N'DangLam',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 5. BẢNG TÀI KHOẢN
CREATE TABLE TaiKhoan (
    TenDangNhap VARCHAR(50) PRIMARY KEY,
    MatKhauHash VARCHAR(255) NOT NULL,
    VaiTro NVARCHAR(50) NOT NULL CHECK (VaiTro IN ('Admin', 'NV_BanHang')),
    TrangThai NVARCHAR(50) DEFAULT N'HoatDong',
    MaNV INT NOT NULL,
    LastLogin DATETIME2,
    LoginFailCount INT DEFAULT 0,
    LockUntil DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- 6. BẢNG THUỐC
CREATE TABLE Thuoc (
    MaThuoc INT IDENTITY(1,1) PRIMARY KEY,
    TenThuoc NVARCHAR(400) NOT NULL,
    HoatChat NVARCHAR(500),
    KhoiLuong NVARCHAR(100),
    GiaBanThamKhao DECIMAL(18,2),
    MaDM VARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Thuoc_DanhMuc FOREIGN KEY (MaDM) REFERENCES DanhMuc(MaDM)
);
CREATE INDEX IX_Thuoc_TenThuoc ON Thuoc(TenThuoc);

-- 7. BẢNG PHIẾU NHẬP
CREATE TABLE PhieuNhap (
    MaPN INT IDENTITY(1,1) PRIMARY KEY,
    NgayNhap DATETIME2 DEFAULT GETDATE(),
    TrangThai NVARCHAR(50) DEFAULT N'DaNhap',
    MaNCC INT NOT NULL,
    MaNV INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_PhieuNhap_NCC FOREIGN KEY (MaNCC) REFERENCES NhaCungCap(MaNCC),
    CONSTRAINT FK_PhieuNhap_NV FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- 8. BẢNG LÔ THUỐC - CHI TIẾT NHẬP
CREATE TABLE LoThuoc_ChiTietNhap (
    MaLo INT IDENTITY(1,1) PRIMARY KEY,
    SoLuongNhap INT NOT NULL,
    SoLuongTonKho INT NOT NULL,
    NgaySX DATE NOT NULL,
    HanSD DATE NOT NULL,
    GiaNhap DECIMAL(18,2) NOT NULL,
    MaPN INT NOT NULL,
    MaThuoc INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_LoThuoc_PhieuNhap FOREIGN KEY (MaPN) REFERENCES PhieuNhap(MaPN),
    CONSTRAINT FK_LoThuoc_Thuoc FOREIGN KEY (MaThuoc) REFERENCES Thuoc(MaThuoc),
    CONSTRAINT CK_LoThuoc_SLNhap CHECK (SoLuongNhap > 0),
    CONSTRAINT CK_LoThuoc_SLTon CHECK (SoLuongTonKho >= 0),
    CONSTRAINT CK_LoThuoc_HanSD CHECK (HanSD > NgaySX)
);
CREATE INDEX IX_LoThuoc_HanSD ON LoThuoc_ChiTietNhap(HanSD);
CREATE INDEX IX_LoThuoc_MaThuoc ON LoThuoc_ChiTietNhap(MaThuoc);

-- 9. BẢNG HÓA ĐƠN
CREATE TABLE HoaDon (
    MaHD INT IDENTITY(1,1) PRIMARY KEY,
    NgayGioLap DATETIME2 DEFAULT GETDATE(),
    TongTien DECIMAL(18,2) NOT NULL,
    TienKhachDua DECIMAL(18,2),
    TienTraLai DECIMAL(18,2),
    TrangThai NVARCHAR(50) DEFAULT N'DaThanhToan',
    MaNV INT NOT NULL,
    MaKH INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_HoaDon_NV FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    CONSTRAINT FK_HoaDon_KH FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);
CREATE INDEX IX_HoaDon_NgayGioLap ON HoaDon(NgayGioLap);

-- 10. BẢNG CHI TIẾT HÓA ĐƠN
CREATE TABLE ChiTietHoaDon (
    MaHD INT NOT NULL,
    MaLo INT NOT NULL,
    SoLuongBan INT NOT NULL,
    GiaBanThucTe DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (MaHD, MaLo),
    CONSTRAINT FK_CTHD_HoaDon FOREIGN KEY (MaHD) REFERENCES HoaDon(MaHD),
    CONSTRAINT FK_CTHD_LoThuoc FOREIGN KEY (MaLo) REFERENCES LoThuoc_ChiTietNhap(MaLo),
    CONSTRAINT CK_CTHD_SLBan CHECK (SoLuongBan > 0)
);

-- 11. BẢNG PHIẾU CHI
CREATE TABLE PhieuChi (
    MaPhieuChi INT IDENTITY(1,1) PRIMARY KEY,
    NgayLap DATETIME2 DEFAULT GETDATE(),
    SoTien DECIMAL(18,2) NOT NULL,
    NoiDung NVARCHAR(500) NOT NULL,
    MaNV INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_PhieuChi_NV FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    CONSTRAINT CK_PhieuChi_SoTien CHECK (SoTien > 0)
);

-- 12. BẢNG AUDIT LOG
CREATE TABLE AuditLog (
    LogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap VARCHAR(50),
    Action NVARCHAR(100) NOT NULL,
    TableName NVARCHAR(100),
    RecordID NVARCHAR(50),
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    IPAddress VARCHAR(50),
    UserAgent NVARCHAR(500),
    Timestamp DATETIME2 DEFAULT GETDATE()
);
CREATE INDEX IX_AuditLog_Timestamp ON AuditLog(Timestamp);
CREATE INDEX IX_AuditLog_User ON AuditLog(TenDangNhap);
```

### 4.3. Seed Data

```sql
-- Danh mục
INSERT INTO DanhMuc (MaDM, TenDM) VALUES
('DM001', N'Kháng sinh'),
('DM002', N'Giảm đau'),
('DM003', N'Hạ sốt'),
('DM004', N'Tiêu hóa'),
('DM005', N'Vitamin');

-- Nhà cung cấp
INSERT INTO NhaCungCap (TenNCC, DiaChi, SDT) VALUES
(N'Công ty Dược phẩm A', N'Hà Nội', '0241234567'),
(N'Công ty Dược phẩm B', N'Hồ Chí Minh', '0281234567'),
(N'Công ty Dược phẩm C', N'Đà Nẵng', '0236123456');

-- Nhân viên
INSERT INTO NhanVien (TenNV, SDT, GioiTinh, Luong, TrangThai) VALUES
(N'Nguyễn Thị Hương', '0912345678', N'Nữ', 15000000, N'DangLam'),
(N'Trần Văn A', '0923456789', N'Nam', 8000000, N'DangLam'),
(N'Lê Thị B', '0934567890', N'Nữ', 8000000, N'DangLam');

-- Tài khoản (password hash sẽ tạo bằng bcrypt khi seed qua Node.js)
-- Admin: admin / admin123
-- NV1: nv1 / nv123
-- NV2: nv2 / nv123
-- MatKhauHash sẽ được generate bằng script Node.js

-- Thuốc (mẫu 20 thuốc)
INSERT INTO Thuoc (TenThuoc, HoatChat, KhoiLuong, GiaBanThamKhao, MaDM) VALUES
(N'Paracetamol 500mg', N'Paracetamol', N'20 viên/hộp', 25000, 'DM002'),
(N'Amoxicillin 500mg', N'Amoxicillin', N'21 viên/hộp', 45000, 'DM001'),
(N'Ibuprofen 400mg', N'Ibuprofen', N'30 viên/hộp', 35000, 'DM002'),
(N'Vitamin C 1000mg', N'Ascorbic acid', N'30 viên/hộp', 55000, 'DM005'),
(N'Omeprazole 20mg', N'Omeprazole', N'14 viên/hộp', 65000, 'DM004');
-- ... thêm 15 thuốc khác
```

---

## 5. BACKEND ARCHITECTURE

### 5.1. Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Kết nối mssql pool
│   ├── middleware/
│   │   ├── auth.js               # verify JWT
│   │   ├── rbac.js               # phân quyền
│   │   ├── validate.js           # validate input
│   │   ├── audit.js              # ghi log
│   │   └── errorHandler.js       # bắt lỗi chung
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.routes.js
│   │   ├── thuoc/
│   │   ├── danhmuc/
│   │   ├── nhacungcap/
│   │   ├── khachhang/
│   │   ├── nhanvien/
│   │   ├── kho/
│   │   ├── banhang/
│   │   ├── taichinh/
│   │   └── thongke/
│   ├── utils/
│   │   ├── response.js           # success(), error()
│   │   ├── crypto.js             # bcrypt, AES
│   │   └── logger.js             # winston
│   ├── app.js                    # Express app
│   └── server.js                 # Entry point
├── database/
│   ├── 01_create_db.sql
│   ├── 02_create_tables.sql
│   ├── 03_seed_data.sql
│   └── 04_hashed_passwords.sql   # Generated by script
├── .env
└── package.json
```

### 5.2. Dependencies chính

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mssql": "^10.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "xss": "^1.0.15",
    "express-validator": "^7.0.0",
    "winston": "^3.10.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0"
  }
}
```

### 5.3. File `.env` mẫu

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DB_SERVER=localhost
DB_NAME=SecurePharmaDB
DB_USER=sa
DB_PASSWORD=YourStrongPassw0rd
DB_ENCRYPT=true

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=8h

# AES
AES_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
AES_IV=0123456789abcdef0123456789abcdef
```

---

## 6. FRONTEND ARCHITECTURE

### 6.1. Cấu trúc thư mục

```
frontend/
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Root + Router
│   ├── index.css                 # Tailwind imports
│   ├── router/
│   │   ├── index.jsx             # Router config
│   │   ├── ProtectedRoute.jsx    # Bảo vệ route theo role
│   │   └── routes.js             # Định nghĩa route paths
│   ├── contexts/
│   │   └── AuthContext.jsx       # user, token, role
│   ├── services/
│   │   ├── axiosClient.js        # Axios instance + interceptor
│   │   ├── authService.js
│   │   ├── thuocService.js
│   │   ├── khoService.js
│   │   ├── banHangService.js
│   │   ├── khachHangService.js
│   │   ├── nhaCungCapService.js
│   │   ├── nhanVienService.js
│   │   ├── taiChinhService.js
│   │   └── thongKeService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   └── useToast.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx    # Sidebar + Header + Outlet
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx       # Menu lọc theo role
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx         # DataTable có sort/paginate
│   │   │   ├── Spinner.jsx
│   │   │   └── ProtectedAction.jsx # Ẩn nút nếu thiếu quyền
│   │   ├── charts/
│   │   │   ├── BarChart.jsx
│   │   │   ├── LineChart.jsx
│   │   │   ├── PieChart.jsx
│   │   │   └── StatCard.jsx
│   │   └── common/
│   │       ├── ErrorBoundary.jsx
│   │       ├── LoadingFallback.jsx
│   │       └── ToastContainer.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── thuoc/
│   │   │   ├── ThuocListPage.jsx
│   │   │   ├── ThuocDetailPage.jsx
│   │   │   └── DanhMucPage.jsx
│   │   ├── kho/
│   │   │   ├── PhieuNhapListPage.jsx
│   │   │   ├── PhieuNhapCreatePage.jsx
│   │   │   ├── TonKhoPage.jsx
│   │   │   └── SapHetHanPage.jsx
│   │   ├── banhang/
│   │   │   ├── BanHangPage.jsx
│   │   │   ├── HoaDonListPage.jsx
│   │   │   └── HoaDonDetailPage.jsx
│   │   ├── khachhang/
│   │   │   └── KhachHangPage.jsx
│   │   ├── nhacungcap/
│   │   │   └── NhaCungCapPage.jsx
│   │   ├── nhanvien/
│   │   │   └── NhanVienPage.jsx
│   │   ├── taichinh/
│   │   │   └── PhieuChiPage.jsx
│   │   ├── baocao/
│   │   │   ├── DoanhThuPage.jsx
│   │   │   └── TopThuocPage.jsx
│   │   └── errors/
│   │       ├── NotFoundPage.jsx
│   │       └── ForbiddenPage.jsx
│   ├── utils/
│   │   ├── format.js             # Format tiền, ngày
│   │   ├── constants.js
│   │   └── validators.js
│   └── types/
│       └── index.js
├── tailwind.config.js
├── vite.config.js
├── .env
└── package.json
```

### 6.2. Dependencies chính

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "axios": "^1.7.7",
    "recharts": "^2.12.7",
    "react-hook-form": "^7.52.0",
    "dayjs": "^1.11.12",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.10",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41"
  }
}
```

---

## 7. ROADMAP TRIỂN KHAI THEO PHASE

| Phase | Thời gian | Output chính | Phụ thuộc |
|:-:|---|---|---|
| **Phase 0** | 1 tuần | Tài liệu thiết kế, ERD, UML | - |
| **Phase 1** | 1 tuần | Skeleton BE + FE + DB chạy được | Phase 0 |
| **Phase 2** | 1 tuần | Login/logout/RBAC hoạt động | Phase 1 |
| **Phase 3** | 3-4 tuần | 10 chức năng nghiệp vụ | Phase 2 |
| **Phase 4** | 1 tuần | 4 cơ chế bảo mật + demo | Phase 3 |
| **Phase 5** | 1 tuần | Test pass toàn bộ | Phase 4 |
| **Phase 6** | 1 tuần | Báo cáo + slide + kịch bản demo | Phase 5 |

**Tổng: ~9-10 tuần**

---

## 8. PHASE 0 – PHÂN TÍCH & THIẾT KẾ

### 8.1. Output cần có

- [ ] Sơ đồ Use Case (tổng quan + chi tiết)
- [ ] Sơ đồ Class Diagram
- [ ] Sơ đồ Activity Diagram (bán thuốc, nhập thuốc)
- [ ] Sơ đồ Sequence Diagram (đăng nhập, bán thuốc, nhập thuốc)
- [ ] ERD
- [ ] Ma trận phân quyền
- [ ] API structure (danh sách endpoints)

### 8.2. Ma trận phân quyền

| Chức năng | Admin | NV_BanHang |
|---|:-:|:-:|
| Đăng nhập / Đăng xuất | ✅ | ✅ |
| Tìm kiếm thuốc | ✅ | ✅ |
| Bán thuốc | ✅ | ✅ |
| Nhập thuốc | ✅ | ✅ |
| CRUD Danh mục | ✅ | ❌ |
| CRUD Thuốc | ✅ | ✅ (read) |
| CRUD NCC | ✅ | ✅ (read) |
| CRUD Khách hàng | ✅ | ✅ (read/create) |
| CRUD Nhân viên | ✅ | ❌ |
| Tạo phiếu chi | ✅ | ❌ |
| Thống kê kho | ✅ | ✅ |
| Thống kê hóa đơn | ✅ | ✅ |
| Thống kê tài chính | ✅ | ❌ |

---

## 9. PHASE 1 – PROJECT FOUNDATION

> **Mục tiêu:** BE đọc/ghi được SQL Server, FE gọi được API và nhận response.

### 9.1. Backend Tasks

| STT | Task | Output |
|:-:|---|---|
| 1 | `npm init`, cài `express`, `mssql`, `cors`, `dotenv` | `package.json` |
| 2 | Tạo `.env` (DB_USER, DB_PASSWORD, JWT_SECRET, PORT) | `.env` |
| 3 | Tạo `config/db.js`: pool mssql | Kết nối thành công |
| 4 | Tạo `middleware/errorHandler.js` | Middleware dùng chung |
| 5 | Tạo `utils/response.js`: `success()`, `error()` | Helper thống nhất |
| 6 | Tạo route test `GET /api/health` | Verify BE chạy |
| 7 | Tạo `app.js` + `server.js` | BE chạy port 8080 |

### 9.2. Frontend Tasks

| STT | Task | Output |
|:-:|---|---|
| 1 | Tạo project bằng Vite + React | `npm create vite@latest` |
| 2 | Cài `react-router-dom`, `axios`, `tailwindcss` | deps sẵn sàng |
| 3 | Tạo `services/axiosClient.js`: axios instance, interceptor gắn token | |
| 4 | Tạo `AuthContext`: lưu `user`, `token` | |
| 5 | Tạo `MainLayout`: header + sidebar + `<Outlet />` | Layout dùng chung |
| 6 | Tạo `ProtectedRoute`: kiểm tra đăng nhập + role | |
| 7 | Tạo trang `/dashboard` hiển thị "Hello SecurePharma" | Verify routing |

### 9.3. Database Tasks

| STT | Task | Output |
|:-:|---|---|
| 1 | Tạo database `SecurePharmaDB` | DB tồn tại |
| 2 | Tạo 10-12 bảng theo script mục 4.2 | Tất cả bảng + FK + Index |
| 3 | Seed danh mục + NCC + nhân viên | Data cơ bản |
| 4 | Tạo script Node.js hash password + insert TaiKhoan | 3 tài khoản demo |

### 9.4. ✅ Done Criteria Phase 1

- [ ] `npm run dev` (backend) → `http://localhost:8080/api/health` trả `{status:"ok"}`
- [ ] `npm run dev` (frontend) → `http://localhost:5173` hiển thị dashboard
- [ ] Kết nối SQL Server thành công (test insert 1 row)
- [ ] FE gọi `/api/health` từ axios → nhận được response
- [ ] Tailwind/CSS cơ bản đã apply

---

## 10. PHASE 2 – AUTHENTICATION & USER MANAGEMENT

> **Mục tiêu:** Đăng nhập/đăng xuất hoạt động, phân quyền Admin vs NV_BanHang.

### 10.1. Database
Không cần tạo bảng mới (đã có `TaiKhoan`, `NhanVien` từ Phase 1).

### 10.2. Backend Tasks

| API | Method | Role | Mô tả |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Nhận `username`, `password` → trả JWT + user info |
| `/api/auth/logout` | POST | All | FE xóa token |
| `/api/auth/me` | GET | All | Lấy thông tin user hiện tại |
| `/api/auth/change-password` | POST | All | Đổi MK (SHOULD) |

**Middleware:**
- `auth.js`: verify JWT, gắn `req.user = {sub, role, maNV}`
- `rbac.js`: factory `rbac(['Admin'])` → check role

**Logic login:**
```javascript
// Pseudo-code
const user = await db.query("SELECT * FROM TaiKhoan WHERE TenDangNhap = @username", [username])
if (!user) return error(401, "Sai tài khoản hoặc mật khẩu")
const ok = await bcrypt.compare(password, user.MatKhauHash)
if (!ok) return error(401, "Sai tài khoản hoặc mật khẩu")
if (user.TrangThai === "Khoa") return error(403, "Tài khoản bị khóa")
const token = jwt.sign({sub: user.TenDangNhap, role: user.VaiTro, maNV: user.MaNV}, SECRET, {expiresIn: "8h"})
return success({token, user: {tenDangNhap, vaiTro, maNV}})
```

### 10.3. Frontend Tasks

| Trang | Chức năng |
|---|---|
| `/login` | Form username + password, lưu token vào localStorage |
| `/change-password` | Đổi MK (SHOULD) |

**Components:**
- `LoginPage.jsx`
- `AuthContext.jsx`: `useAuth()` → `{user, token, login(), logout()}`
- `ProtectedRoute.jsx`: redirect về `/login` nếu chưa auth
- `RoleGuard.jsx`: ẩn nút nếu user không có role phù hợp

### 10.4. Security (triển khai ngay tại Phase này)

| Cơ chế | Vị trí |
|---|---|
| **bcrypt hash mật khẩu** | Khi tạo user (Admin seed sẵn) |
| **JWT có expiry** | `expiresIn: "8h"` |
| **So sánh password an toàn** | `bcrypt.compare` |
| **Ẩn lỗi chi tiết** | "Sai tài khoản hoặc mật khẩu" (chung chung) |
| **Không log password** | Middleware xóa password khỏi log |

### 10.5. ✅ Done Criteria Phase 2

- [ ] Đăng nhập `admin/admin123` → nhận token → vào dashboard
- [ ] Đăng nhập `nv1/nv123` → nhận token → vào dashboard
- [ ] Sai MK → hiển thị lỗi chung
- [ ] Truy cập `/nhan-vien` (chỉ Admin) bằng NV → 403
- [ ] Logout → xóa token → redirect về `/login`

---

## 11. PHASE 3 – CORE BUSINESS FEATURES

> Triển khai theo **dependency order**. Mỗi Module độc lập về code, nhưng phụ thuộc dữ liệu.

### 11.1. Thứ tự triển khai Module

```
3A. Danh mục + Thuốc (CRUD, tìm kiếm)
   ↓
3B. Nhà cung cấp (CRUD)
   ↓
3C. Khách hàng (CRUD)
   ↓
3D. Nhân viên (CRUD)
   ↓
3E. Kho + Lô thuốc (Nhập thuốc, Quản lý lô)
   ↓
3F. Bán hàng (Bán thuốc - FIFO lô)
   ↓
3G. Tài chính (Phiếu chi)
   ↓
3H. Thống kê (Kho + Hóa đơn + Tài chính)
```

---

### 🅰️ Module 3A – Danh mục & Thuốc

#### Mục tiêu
CRUD nhóm thuốc + CRUD thuốc + tìm kiếm thuốc theo nhiều tiêu chí.

#### Database
| Bảng | Trường quan trọng |
|---|---|
| `DanhMuc` | `MaDM (PK)`, `TenDM` |
| `Thuoc` | `MaThuoc (PK)`, `TenThuoc`, `HoatChat`, `KhoiLuong`, `GiaBanThamKhao`, `MaDM (FK)` |

#### Backend API
| API | Method | Role |
|---|---|---|
| `/api/danh-muc` | GET/POST/PUT/DELETE | Admin (write), All (read) |
| `/api/thuoc?keyword=&page=&limit=` | GET | All |
| `/api/thuoc` | POST | Admin |
| `/api/thuoc/:id` | PUT/DELETE | Admin |

#### Frontend
| Trang | Component |
|---|---|
| `/thuoc` | `ThuocListPage`: bảng + thanh tìm kiếm |
| `/thuoc/:id` | `ThuocDetailPage` |
| `/danh-muc` | `DanhMucPage`: CRUD nhóm |

#### Security
- Validate input: `TenThuoc` không rỗng, `GiaBanThamKhao` ≥ 0
- Search dùng `LIKE @kw` (parameterized)

#### Done Criteria
- [ ] Tạo/sửa/xóa danh mục
- [ ] Tạo/sửa/xóa thuốc
- [ ] Tìm "Paracetamol" → hiển thị danh sách

---

### 🅱️ Module 3B – Nhà cung cấp

#### Mục tiêu
CRUD nhà cung cấp (chuẩn bị cho nhập hàng).

#### Backend / Frontend
| API | Trang |
|---|---|
| `/api/nha-cung-cap` CRUD | `/nha-cung-cap` |

#### Security
- Validate SĐT (10-11 số, regex)

---

### 🅲 Module 3C – Khách hàng

#### Mục tiêu
CRUD khách hàng + tích hợp mã hóa SDT (SHOULD).

#### Backend
| API | Method |
|---|---|
| `/api/khach-hang` | CRUD |

#### Security
- **Mã hóa SDT bằng AES-256** trước khi lưu (SHOULD)
- Khi đọc → giải mã (chỉ Admin/NV được phép xem)

---

### 🅳 Module 3D – Nhân viên

#### Mục tiêu
CRUD nhân viên (Admin only).

#### Backend
| API | Method | Role |
|---|---|---|
| `/api/nhan-vien` | GET | Admin |
| `/api/nhan-vien` | POST | Admin |
| `/api/nhan-vien/:id` | PUT | Admin |
| `/api/nhan-vien/:id` | DELETE | Admin |

#### Frontend
`/nhan-vien`: bảng + form + nút tạo mới.

#### Security
- Validate: không cho xóa chính mình
- Validate: chỉ Admin được truy cập

---

### 🅴 Module 3E – Kho & Lô thuốc ⭐ (đặc thù dược)

#### Mục tiêu
Nhập thuốc (phiếu nhập + chi tiết lô), cảnh báo hết hàng/hết hạn.

#### Database
| Bảng | Trường quan trọng |
|---|---|
| `PhieuNhap` | `MaPN, NgayNhap, TrangThai, MaNCC (FK), MaNV (FK)` |
| `LoThuoc_ChiTietNhap` | `MaLo (PK), SoLuongNhap, SoLuongTonKho, NgaySX, HanSD, GiaNhap, MaPN (FK), MaThuoc (FK)` |

#### Backend API
| API | Method | Role | Mô tả |
|---|---|---|---|
| `/api/phieu-nhap` | POST | Admin | Tạo phiếu nhập + nhiều lô (transaction) |
| `/api/phieu-nhap` | GET | All | Danh sách phiếu nhập |
| `/api/kho/ton-kho` | GET | All | Tổng tồn kho theo thuốc |
| `/api/kho/sap-het-hang?nguong=10` | GET | All | Cảnh báo sắp hết |
| `/api/kho/sap-het-han?days=30` | GET | All | Cảnh báo sắp hết hạn |

#### Frontend
- `/kho/nhap`: Form tạo phiếu nhập (chọn NCC → chọn nhiều thuốc → nhập SL, NSX, HSD, giá nhập)
- `/kho/ton-kho`: bảng tồn kho + badge cảnh báo
- `/kho/sap-het-han`: danh sách thuốc sắp hết hạn

#### Security
- **Validate**: HSD > NSX; SL nhập > 0; giá nhập ≥ 0
- **Audit log**: ghi INSERT/UPDATE `LoThuoc_ChiTietNhap`

#### Done Criteria
- [ ] Tạo phiếu nhập → tồn kho được cộng đúng
- [ ] Cảnh báo thuốc sắp hết hạn (≤30 ngày) hiển thị đúng

---

### 🅵 Module 3F – Bán hàng ⭐ (nghiệp vụ cốt lõi)

#### Mục tiêu
Lập hóa đơn bán thuốc, **tự động chọn lô FIFO** (lô cũ nhất còn hàng).

#### Database
| Bảng | Trường |
|---|---|
| `HoaDon` | `MaHD, NgayGioLap, TongTien, TienKhachDua, TienTraLai, TrangThai, MaNV, MaKH` |
| `ChiTietHoaDon` | `MaHD (PK), MaLo (PK), SoLuongBan, GiaBanThucTe` |

#### Backend API
| API | Method | Role |
|---|---|---|
| `/api/ban-hang` | POST | Admin, NV_BanHang |
| `/api/hoa-don` | GET | All |
| `/api/hoa-don/:id` | GET | All |
| `/api/hoa-don/:id/huy` | PUT | Admin |

**Logic FIFO:**
```sql
-- Lấy lô cũ nhất còn hàng & chưa hết hạn
SELECT TOP 1 * FROM LoThuoc_ChiTietNhap
WHERE MaThuoc = @id AND SoLuongTonKho > 0 AND HanSD > GETDATE()
ORDER BY HanSD ASC
```

**Transaction bán hàng:**
1. Validate số lượng tồn
2. Chọn lô FIFO
3. Trừ tồn kho
4. Tạo `HoaDon` + `ChiTietHoaDon`
5. Cập nhật `TongTien`, `TienTraLai`

#### Frontend
- `/ban-hang`: 
  - Ô tìm thuốc (autocomplete)
  - Bảng giỏ hàng (thêm/xóa/sửa SL)
  - Ô "Tiền khách đưa" → auto tính tiền thừa
  - Nút "Hoàn thành"
- `/hoa-don`: danh sách + filter ngày
- `/hoa-don/:id`: chi tiết + in

#### Security
- Check `SoLuongBan <= SoLuongTonKho` (server-side)
- Transaction đảm bảo atomic
- Audit log: ghi lại toàn bộ chi tiết hóa đơn

#### Done Criteria
- [ ] Bán 1 thuốc → trừ đúng tồn kho lô cũ nhất
- [ ] Bán quá tồn kho → báo lỗi "Không đủ hàng"
- [ ] Hủy hóa đơn (Admin) → hoàn lại tồn kho

---

### 🅶 Module 3G – Tài chính

#### Mục tiêu
Tạo phiếu chi. Phiếu thu nếu có thời gian (SHOULD).

#### Database
`PhieuChi(MaPhieuChi, NgayLap, SoTien, NoiDung, MaNV)`.

#### Backend API
| API | Method | Role |
|---|---|---|
| `/api/phieu-chi` | POST | Admin |
| `/api/phieu-chi` | GET | Admin |

#### Validation
- `SoTien > 0`
- `SoTien <= Số dư hiện tại` (tổng tiền bán - tổng chi)

---

### 🅷 Module 3H – Thống kê

#### Mục tiêu
3 loại thống kê theo báo cáo mục 2.1.1.8 → 2.1.1.10.

#### Backend API
| API | Method | Role | Output |
|---|---|---|---|
| `/api/thong-ke/kho` | GET | All | Tồn kho + cảnh báo |
| `/api/thong-ke/hoa-don?from=&to=` | GET | All | Doanh thu + top thuốc |
| `/api/thong-ke/tai-chinh?from=&to=` | GET | Admin | Tổng thu/chi/lợi nhuận |

#### Frontend
- Dashboard với 3-4 card thống kê
- Biểu đồ đường (doanh thu), cột (top thuốc), tròn (tỷ lệ danh mục) – dùng **Recharts**
- Filter theo khoảng thời gian

---

## 12. PHASE 4 – SECURITY

### 12.1. Báo cáo yêu cầu những gì? (mục 3.3)

| # | Yêu cầu | Mục báo cáo |
|:-:|---|---|
| 1 | Phân quyền RBAC | 3.3.1 |
| 2 | Mã hóa dữ liệu | 3.3.2 |
| 3 | Phòng chống XSS | 3.3.3 |
| 4 | Phòng chống SQL Injection | 3.3.3 |

> Báo cáo **không yêu cầu** CSRF, MFA, rate-limit, Zero Trust, IDS, WAF → KHÔNG đưa vào MUST.

### 12.2. Mapping Security

#### 🔴 SQL Injection

| Mục | Nội dung |
|---|---|
| **Vị trí có nguy cơ** | Login (username), Tìm kiếm thuốc, mọi CRUD có input |
| **Cách triển khai** | Dùng **parameterized query** của `mssql` |
| **Cách kiểm thử** | Thử payload `' OR '1'='1` |
| **Cách demo** | So sánh trước/sau: SQLi login → fail; sau khi fix → an toàn |

```javascript
// ✅ ĐÚNG
const result = await pool.request()
  .input('username', sql.VarChar, username)
  .query('SELECT * FROM TaiKhoan WHERE TenDangNhap = @username');
```

#### 🔴 XSS (Cross-Site Scripting)

| Mục | Nội dung |
|---|---|
| **Vị trí có nguy cơ** | Tên thuốc, tên NCC, tên KH (render qua React) |
| **Cách triển khai** | (1) Escape input ở BE (thư viện `xss`); (2) React mặc định escape → không dùng `dangerouslySetInnerHTML` |
| **Cách kiểm thử** | Nhập tên thuốc `<script>alert('XSS')</script>` → render thành text |
| **Cách demo** | Trước: hiện alert; Sau: chỉ hiển thị text |

```javascript
// Backend
const xss = require('xss');
const cleanTenThuoc = xss(req.body.tenThuoc);
```

#### 🔴 Phân quyền RBAC

| Mục | Nội dung |
|---|---|
| **Vị trí có nguy cơ** | Mọi API có role requirement |
| **Cách triển khai** | Middleware `rbac(['Admin'])` |
| **Cách kiểm thử** | NV gọi API Admin bằng Postman → 403 |
| **Cách demo** | Bảng ma trận phân quyền Admin vs NV |

#### 🔴 Mã hóa dữ liệu

| Loại dữ liệu | Phương pháp | Triển khai |
|---|---|---|
| **Mật khẩu** | bcrypt (one-way hash) | `bcrypt.hash()` khi tạo, `bcrypt.compare()` khi login |
| **SDT (SHOULD)** | AES-256 (two-way) | `crypto.createCipheriv('aes-256-cbc', ...)` |
| **Token** | JWT signed | `jwt.sign({sub, role}, SECRET, {expiresIn: "8h"})` |

### 12.3. Security Implementation Map

| Vấn đề | Backend | Frontend | SQL Server |
|---|---|---|---|
| **SQLi** | `mssql` parameterized query | Validate trước khi gửi | Stored Procedure (optional) |
| **XSS** | `xss` middleware escape input | React tự escape (KHÔNG dùng `dangerouslySetInnerHTML`) | N/A |
| **Auth** | `bcrypt` + `jsonwebtoken` | Lưu token localStorage + interceptor | `TaiKhoan.MatKhauHash` |
| **RBAC** | `rbac()` middleware | `RoleGuard` ẩn nút | Cột `VaiTro` |

### 12.4. Security Demo Flow

**Demo 1: SQL Injection**
```
1. Mở Postman → POST /api/auth/login
2. Body: {"username": "' OR '1'='1' --", "password": "anything"}
3. Kết quả: 401 Sai tài khoản hoặc mật khẩu
4. Chứng minh: KHÔNG login được, KHÔNG lộ danh sách user
```

**Demo 2: XSS**
```
1. Đăng nhập Admin → Thêm thuốc
2. Tên thuốc: <script>alert(document.cookie)</script>
3. Xem danh sách thuốc → hiển thị text (KHÔNG alert)
4. Chứng minh: input bị escape
```

**Demo 3: Phân quyền**
```
1. Đăng nhập NV_BanHang
2. NV cố truy cập /api/nhan-vien bằng Postman
3. Kết quả: 403 Forbidden
4. Cùng API gọi bằng Admin → 200 OK
```

**Demo 4: Mã hóa mật khẩu**
```
1. Mở SQL Server → bảng TaiKhoan
2. Cột MatKhauHash hiển thị: $2b$10$abc...
3. Giải thích: bcrypt one-way hash, không thể reverse
```

### 12.5. Optional Security Recommendation

| Cơ chế | Lý do nên có | Triển khai khi nào |
|---|---|---|
| **CSRF token** | Bảo vệ form khỏi request giả mạo | Khi dùng cookie auth |
| **Rate-limit login** | Chống brute-force | Khi muốn demo nâng cao |
| **HTTPS local** | Mã hóa đường truyền | Khi muốn demo giống production |
| **Helmet** | Set secure headers | 5 phút cài đặt, nên có |
| **Audit log** | Theo dõi truy cập | NÊN CÓ vì báo cáo mục 1.7 đề cập |

> ⚠️ **KHÔNG đưa** vào phần bắt buộc: MFA, OAuth, SSO, Zero Trust, WAF, IDS, TDE.

---

## 13. PHASE 5 – INTEGRATION & TESTING

### 13.1. Test Checklist

#### Authentication
- [ ] Login đúng user/pass → token trả về
- [ ] Login sai → 401, không lộ thông tin
- [ ] Token hết hạn → 401
- [ ] Không có token → 401
- [ ] Đăng xuất → token bị xóa FE

#### Phân quyền (RBAC)
- [ ] NV gọi API Admin → 403
- [ ] Admin truy cập mọi API → 200
- [ ] NV truy cập API của NV → 200

#### Quản lý thuốc
- [ ] CRUD đầy đủ
- [ ] Validate input (rỗng, âm, ...)
- [ ] Tìm kiếm đúng kết quả

#### Kho / Lô
- [ ] Tạo phiếu nhập → tồn kho tăng đúng
- [ ] FIFO: bán → trừ lô cũ nhất trước
- [ ] Cảnh báo sắp hết hạn (≤30 ngày)
- [ ] Cảnh báo sắp hết hàng (≤10)

#### Bán hàng
- [ ] Bán 1 thuốc → tạo HĐ + trừ kho
- [ ] Bán nhiều thuốc cùng lúc → tính đúng tổng tiền
- [ ] Tiền khách đưa < tổng → báo lỗi
- [ ] Bán quá tồn → 409 Conflict
- [ ] Hủy HĐ (Admin) → hoàn kho

#### Tài chính
- [ ] Tạo phiếu chi < số dư → OK
- [ ] Tạo phiếu chi > số dư → lỗi
- [ ] Thống kê doanh thu khớp sổ sách

#### Security
- [ ] SQL Injection: payload `' OR '1'='1` → fail
- [ ] XSS: tên thuốc `<script>...</script>` → render text
- [ ] Bcrypt hash không hiển thị plain text
- [ ] Audit log ghi lại INSERT/UPDATE/DELETE

#### FE-BE Integration
- [ ] Loading state hiển thị khi gọi API
- [ ] Error state hiển thị khi API lỗi
- [ ] Empty state khi không có dữ liệu
- [ ] Pagination hoạt động
- [ ] Form validation đầy đủ

### 13.2. Công cụ test

| Mục đích | Tool |
|---|---|
| API test | **Postman** (manual) hoặc **Thunder Client** (VSCode) |
| SQLi/XSS test | **Postman** với payload, hoặc **sqlmap** (optional) |
| FE manual test | Trình duyệt (Chrome DevTools) |
| Auto test | **Không bắt buộc** cho đồ án (Jest/Supertest nếu muốn) |

---

## 14. PHASE 6 – HOÀN THIỆN ĐỒ ÁN

### 14.1. Deliverable Checklist

| # | Hạng mục | Chi tiết |
|:-:|---|---|
| 1 | **Seed data đầy đủ** | 1 Admin + 2 NV, 5 danh mục, 20-30 thuốc, 3 NCC, 50+ lô, 100+ hóa đơn lịch sử |
| 2 | **Tài khoản demo** | `admin/admin123`, `nv1/nv123`, `nv2/nv123` |
| 3 | **UI hoàn thiện** | Loading, error, empty state; responsive cơ bản |
| 4 | **API documentation** | File `docs/API.md` (Markdown) - liệt kê endpoints |
| 5 | **ERD** | Vẽ bằng StarUML hoặc draw.io → `docs/ERD.png` |
| 6 | **Use Case Diagram** | StarUML → `docs/Usecase.png` |
| 7 | **Sequence Diagram** | Các flow: Đăng nhập, Bán thuốc, Nhập thuốc |
| 8 | **Activity Diagram** | Bán thuốc, Nhập thuốc |
| 9 | **Security documentation** | Phần 3.3 báo cáo: giải thích 4 cơ chế + hình demo |
| 10 | **Screenshot minh họa** | Chụp từng chức năng chính (có captioned) |
| 11 | **Kịch bản demo** | Slide 10-15 phút, script nói |

### 14.2. Cấu trúc báo cáo

| Chương | Nội dung |
|---|---|
| Mở đầu | Lý do, mục tiêu, phạm vi |
| Chương 1 | Cơ sở lý thuyết + công cụ |
| Chương 2 | Phân tích & thiết kế (UML + ERD) |
| **Chương 3** | **Xây dựng & Đánh giá** (quan trọng nhất, nhiều hình) |
| Kết luận | Ưu điểm, hạn chế, hướng phát triển |
| Phụ lục | Source code, script SQL |

### 14.3. Kịch bản demo gợi ý (10-15 phút)

| Phút | Nội dung |
|:-:|---|
| 0-2 | Giới thiệu đề tài, lý do chọn, khảo sát thực tế |
| 2-3 | Demo kiến trúc tổng quan (ERD + sơ đồ) |
| 3-5 | Demo luồng bán thuốc (nhân viên): login → tìm thuốc → bán → in HĐ |
| 5-7 | Demo luồng nhập thuốc (quản lý): tạo phiếu nhập → kiểm tra tồn kho |
| 7-9 | Demo thống kê: dashboard doanh thu + cảnh báo hết hạn |
| 9-11 | Demo phân quyền: NV không vào được `/nhan-vien` |
| 11-13 | Demo bảo mật: SQLi + XSS + bcrypt hash |
| 13-15 | Tổng kết, hướng phát triển |

---

## 15. THỨ TỰ CODE CỤ THỂ ĐỂ TEAM BẮT ĐẦU

### Tuần 1 (Foundation)

```
Ngày 1-2:
  - BE: npm init, cài deps, kết nối mssql, test health check
  - FE: npm create vite, cài router/axios/tailwind, MainLayout

Ngày 3-4:
  - DB: tạo DB, 12 bảng, FK, seed 1 admin + 2 NV + 5 DM + 20 thuốc
  - BE: middleware errorHandler, utils response

Ngày 5-7:
  - FE: AuthContext, ProtectedRoute, test gọi /api/health
```

### Tuần 2 (Auth)

```
Ngày 1-3:
  - BE: POST /api/auth/login (bcrypt + JWT), middleware auth/rbac

Ngày 4-5:
  - FE: LoginPage, lưu token, redirect

Ngày 6-7:
  - Test login admin vs nv, test RBAC
```

### Tuần 3-4 (Core CRUD)

```
Module 3A (DM + Thuốc) → 3B (NCC) → 3C (KH) → 3D (NV)
Mỗi module: BE API → FE Page → Test
```

### Tuần 5-6 (Nghiệp vụ chính)

```
3E (Kho/Lô) → 3F (Bán hàng - FIFO) → 3G (Phiếu chi)
```

### Tuần 7 (Thống kê + Hoàn thiện)

```
3H (Thống kê) → polish UI → seed nhiều data → viết báo cáo
```

---

## 16. LƯU Ý QUAN TRỌNG

1. **Đừng over-engineering**: Báo cáo nói 10 chức năng → làm đủ 10, không tự thêm.
2. **Đồ án sinh viên ≠ Production**: Không cần Docker, CI/CD, microservices, Redis, message queue.
3. **TypeScript là OPTIONAL**: Nếu nhóm chưa quen → dùng **JavaScript thuần** + JSDoc để đỡ phức tạp.
4. **Redux là OPTIONAL**: Dùng **React Context + useState** là đủ cho quy mô này.
5. **Bảo mật là điểm cộng lớn**: Tập trung vào **4 cơ chế báo cáo yêu cầu** (RBAC, Mã hóa, SQLi, XSS), đừng lan man sang CSRF/MFA/Zero Trust.
6. **Demo phải chạy được**: Ưu tiên luồng Bán thuốc + Nhập thuốc + Thống kê + Phân quyền + 1 demo SQLi.
7. **Báo cáo nặng về hình ảnh**: Mỗi chức năng có screenshot, mỗi cơ chế bảo mật có ảnh demo trước/sau.
8. **Database đơn giản**: Không cần TDE, partitioning, replication - chỉ cần FK + Index cơ bản.
9. **Audit log**: Triển khai ngay từ đầu, tốn 2-3 giờ nhưng phục vụ cả báo cáo lẫn demo bảo mật.
10. **Thứ tự triển khai quan trọng**: Auth phải xong TRƯỚC khi làm nghiệp vụ, vì mọi API đều cần JWT.

---

## 📝 CHECKLIST TỔNG HỢP

### Backend Checklist
- [ ] Khởi tạo Node.js project với Express
- [ ] Kết nối SQL Server thành công
- [ ] Middleware: auth, rbac, validate, errorHandler
- [ ] Utils: response, crypto (bcrypt + AES)
- [ ] Module Auth (login/logout/me)
- [ ] Module Thuốc + Danh mục (CRUD + search)
- [ ] Module NCC (CRUD)
- [ ] Module Khách hàng (CRUD + AES SDT)
- [ ] Module Nhân viên (CRUD + Admin only)
- [ ] Module Kho (phiếu nhập + tồn kho + cảnh báo)
- [ ] Module Bán hàng (FIFO lô)
- [ ] Module Tài chính (phiếu chi)
- [ ] Module Thống kê (kho + hóa đơn + tài chính)
- [ ] Audit log cho INSERT/UPDATE/DELETE
- [ ] Seed data đầy đủ

### Frontend Checklist
- [ ] Khởi tạo React + Vite + Tailwind
- [ ] Router + ProtectedRoute + RoleGuard
- [ ] AuthContext + axiosClient (interceptor)
- [ ] MainLayout (sidebar + header)
- [ ] Trang Login
- [ ] Trang Dashboard
- [ ] Trang CRUD Thuốc + Danh mục
- [ ] Trang CRUD NCC
- [ ] Trang CRUD Khách hàng
- [ ] Trang CRUD Nhân viên
- [ ] Trang Nhập thuốc (phiếu nhập)
- [ ] Trang Tồn kho + Cảnh báo
- [ ] Trang Bán hàng (FIFO)
- [ ] Trang Hóa đơn (danh sách + chi tiết)
- [ ] Trang Phiếu chi
- [ ] Trang Thống kê (biểu đồ)
- [ ] Trang 403, 404
- [ ] Loading + Error + Empty state

### Security Checklist (theo báo cáo)
- [ ] Bcrypt hash mật khẩu
- [ ] JWT với expiry
- [ ] RBAC middleware
- [ ] Parameterized query (SQLi)
- [ ] XSS escape (BE + FE)
- [ ] Audit log

### Documentation Checklist
- [ ] ERD
- [ ] Use Case Diagram
- [ ] Class Diagram
- [ ] Activity Diagram
- [ ] Sequence Diagram
- [ ] API documentation
- [ ] Security documentation (4 cơ chế)
- [ ] Screenshot minh họa
- [ ] Kịch bản demo
- [ ] README.md

---

> 💡 **Ghi chú:** File này là bản kế hoạch triển khai chi tiết, team có thể dùng làm checklist hàng ngày. Cập nhật khi có thay đổi về scope hoặc phát sinh vấn đề mới.
