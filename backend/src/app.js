/**
 * Express Application Setup
 *
 * Phase 1: Foundation (health check, DB connection)
 * Phase 2: Auth (login/logout/me/change-password)
 * Phase 3A-D: Danh mục, Thuốc, NCC, Khách hàng, Nhân viên
 * Phase 3E-H: Kho, Bán hàng, Tài chính, Thống kê (TODO)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { xssSanitize } = require('./middleware/xss');
const { writeLimiter } = require('./middleware/rateLimit');

const app = express();

// Security middleware
app.use(helmet());

// CORS - cho phép FE dev server
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Protection - Deep recursive sanitize (nested objects, arrays)
app.use(xssSanitize);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        },
        message: 'Server is running'
    });
});

// Welcome endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'SecurePharma API',
            version: '1.0.0',
            phase: '1 - Foundation',
            description: 'Quản lý cửa hàng dược phẩm'
        },
        message: 'Welcome to SecurePharma API'
    });
});

// Import routers
const authRouter = require('./modules/auth/auth.routes');
const danhMucRouter = require('./modules/danhMuc/danhMuc.routes');
const thuocRouter = require('./modules/thuoc/thuoc.routes');
const nhaCungCapRouter = require('./modules/nhaCungCap/nhaCungCap.routes');
const khachHangRouter = require('./modules/khachHang/khachHang.routes');
const nhanVienRouter = require('./modules/nhanVien/nhanVien.routes');
const khoRouter = require('./modules/kho/kho.routes');
const phieuNhapRouter = require('./modules/phieuNhap/phieuNhap.routes');
const banHangRouter = require('./modules/banHang/banHang.routes');
const hoaDonRouter = require('./modules/banHang/hoaDon.routes');
const phieuChiRouter = require('./modules/phieuChi/phieuChi.routes');
const thongKeRouter = require('./modules/thongKe/thongKe.routes');

// ========== API Routes (Phase 2) ==========
app.use('/api/auth', authRouter);

// ========== API Routes (Phase 3A - Danh mục & Thuốc) ==========
app.use('/api/danh-muc', danhMucRouter);
app.use('/api/thuoc', thuocRouter);

// ========== API Routes (Phase 3B - Nhà cung cấp) ==========
app.use('/api/nha-cung-cap', nhaCungCapRouter);

// ========== API Routes (Phase 3C - Khách hàng) ==========
app.use('/api/khach-hang', khachHangRouter);

// ========== API Routes (Phase 3D - Nhân viên) ==========
app.use('/api/nhan-vien', nhanVienRouter);

// ========== API Routes (Phase 3E - Kho & Lô thuốc) ==========
app.use('/api/kho', khoRouter);
app.use('/api/phieu-nhap', phieuNhapRouter);

// ========== API Routes (Phase 3F - Bán hàng) ==========
// /api/ban-hang: action tạo hóa đơn (POST)
// /api/hoa-don: resource collection (GET, PUT /:id/huy)
app.use('/api/ban-hang', banHangRouter);
app.use('/api/hoa-don', hoaDonRouter);

// ========== API Routes (Phase 3G - Tài chính) ==========
app.use('/api/phieu-chi', phieuChiRouter);

// ========== API Routes (Phase 3H - Thống kê) ==========
app.use('/api/thong-ke', thongKeRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
