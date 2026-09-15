# 🚀 HƯỚNG DẪN CÀI ĐẶT SECUREPHARMA

> Hướng dẫn chi tiết để chạy dự án SecurePharma trên máy local.

---

## 📋 Yêu cầu hệ thống

| Phần mềm | Version | Ghi chú |
|---|---|---|
| **Node.js** | 18+ | [Download](https://nodejs.org/) |
| **SQL Server** | 2019+ | [Download Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| **SQL Server Management Studio (SSMS)** | Mới nhất | Để chạy script SQL |
| **Git** | Mới nhất | Để clone repo (nếu cần) |

---

## 🔧 BƯỚC 1: Cài đặt Database

### 1.1. Mở SQL Server Management Studio (SSMS)

- Kết nối đến SQL Server của bạn (thường là `localhost` hoặc `.\SQLEXPRESS` với Windows Authentication)

### 1.2. Chạy script tạo bảng

Mở file: `backend/database/01_create_tables.sql`

- Script này sẽ tạo database `SecurePharmaDB` và 12 bảng:
  - `DanhMuc`, `NhaCungCap`, `KhachHang`, `NhanVien`, `TaiKhoan`
  - `Thuoc`, `PhieuNhap`, `LoThuoc_ChiTietNhap`
  - `HoaDon`, `ChiTietHoaDon`, `PhieuChi`
  - `AuditLog`

### 1.3. Chạy script seed data

Mở file: `backend/database/02_seed_data.sql`

- Script này sẽ insert dữ liệu mẫu:
  - 8 danh mục thuốc
  - 5 nhà cung cấp
  - 3 nhân viên (sẽ tạo tài khoản ở Phase 2)
  - 20 thuốc
  - 5 khách hàng

### 1.4. Verify database

Trong SSMS, chạy query:
```sql
USE SecurePharmaDB;
SELECT COUNT(*) AS SoBang FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
-- Kết quả phải là 12

SELECT COUNT(*) AS SoThuoc FROM Thuoc;
-- Kết quả phải là 20
```

---

## 🔧 BƯỚC 2: Cấu hình Backend

### 2.1. Mở file `backend/.env`

Đảm bảo thông tin đúng với SQL Server của bạn:

```env
# Server
PORT=8080
NODE_ENV=development

# Database - SỬA CHO ĐÚNG MÁY CỦA BẠN
DB_SERVER=localhost              # Hoặc .\SQLEXPRESS nếu dùng bản Express
DB_NAME=SecurePharmaDB
DB_USER=sa                        # Hoặc user khác
DB_PASSWORD=YourPassword123       # SỬA MẬT KHẨU
DB_ENCRYPT=true
DB_PORT=1433

# JWT (chưa dùng ở Phase 1)
JWT_SECRET=SecurePharmaSuperSecretKey2024
JWT_EXPIRES_IN=8h

# AES (chưa dùng ở Phase 1)
AES_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
AES_IV=0123456789abcdef
```

### 2.2. Lưu ý quan trọng

- **Nếu dùng SQL Server Express**: đổi `DB_SERVER=localhost` thành `DB_SERVER=.\SQLEXPRESS`
- **Nếu dùng Windows Authentication**: bỏ `DB_USER` và `DB_PASSWORD`, dùng cách khác
- **Nếu dùng port khác 1433**: đổi `DB_PORT`

---

## 🔧 BƯỚC 3: Cài đặt Backend

Mở terminal (PowerShell/CMD) tại thư mục gốc dự án:

```bash
cd backend
npm install
```

Quá trình này sẽ cài:
- `express` - Web framework
- `mssql` - SQL Server driver
- `cors` - CORS middleware
- `helmet` - Security headers
- `dotenv` - Environment variables
- `xss` - XSS protection
- `bcrypt`, `jsonwebtoken` (cho Phase 2)

---

## 🔧 BƯỚC 4: Cài đặt Frontend

Mở terminal **MỚI**:

```bash
cd frontend
npm install
```

Quá trình này sẽ cài:
- `react`, `react-dom` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `recharts` (cho Phase 3 thống kê)
- `react-hook-form` (cho Phase 3 forms)

---

## 🔧 BƯỚC 5: Chạy Backend

Trong terminal của backend:

```bash
npm run dev
```

**Output mong đợi:**
```
🔄 Connecting to database...
✅ Database query test passed: 2026-09-15 ...
╔══════════════════════════════════════════════════════════════╗
║           SecurePharma Backend Server                      ║
╠══════════════════════════════════════════════════════════════╣
║  🌐 Server running on: http://localhost:8080                ║
║  📊 Health check:      http://localhost:8080/api/health     ║
║  🔧 Environment:       development                          ║
╚══════════════════════════════════════════════════════════════╝
```

**Nếu lỗi "Database connection failed":**
- Kiểm tra SQL Server đã chạy chưa
- Kiểm tra `DB_SERVER`, `DB_USER`, `DB_PASSWORD` trong `.env`
- Kiểm tra database `SecurePharmaDB` đã tạo chưa

---

## 🔧 BƯỚC 6: Chạy Frontend

Trong terminal của frontend:

```bash
npm run dev
```

**Output mong đợi:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔧 BƯỚC 7: Verify

### 7.1. Mở trình duyệt

Truy cập: **http://localhost:5173**

### 7.2. Test API Connection

Bạn sẽ thấy trang:
- Tiêu đề "SecurePharma - Phase 1 Foundation"
- 3 status cards (Backend / Database / Frontend)
- 1 button "Test API Connection"

Click button **"Test API Connection"** → Kết quả:

✅ **Thành công** (màu xanh):
```
✅ Kết nối thành công!
Status: ok
Timestamp: 2026-09-15T...
Uptime: 5s
```

❌ **Thất bại** (màu đỏ):
- Kiểm tra backend đã chạy chưa
- Kiểm tra CORS có cho phép port 5173 không

### 7.3. Test trực tiếp API

Mở terminal mới:
```bash
curl http://localhost:8080/api/health
```

Hoặc mở trình duyệt: `http://localhost:8080/api/health`

Response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-09-15T...",
    "uptime": 5.123
  },
  "message": "Server is running"
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'mssql'"
```bash
cd backend
rm -rf node_modules
npm install
```

### Lỗi: "ECONNREFUSED 127.0.0.1:1433"
- SQL Server chưa chạy
- Hoặc sai port (mặc định 1433)
- Hoặc SQL Server Express dùng instance name khác

### Lỗi: "Login failed for user 'sa'"
- Sai password trong `.env`
- User `sa` bị disable → enable trong SSMS

### Lỗi: "CORS policy blocked"
- Backend chưa chạy
- Hoặc FE đang chạy port khác 5173

### Lỗi: Tailwind không apply
```bash
cd frontend
# Xóa cache
rm -rf node_modules/.vite
npm run dev
```

---

## ✅ Hoàn thành Phase 1!

Nếu bạn đã:
- [x] Backend chạy được port 8080
- [x] Frontend chạy được port 5173
- [x] Click "Test API Connection" thấy status: ok
- [x] Database có 12 bảng + 20 thuốc

→ **Phase 1 HOÀN THÀNH!** Sang Phase 2 - Authentication.

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console của trình duyệt (F12)
2. Terminal output của backend
3. SQL Server log
