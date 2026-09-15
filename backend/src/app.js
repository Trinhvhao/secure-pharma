/**
 * Express Application Setup - PHASE 1 (Foundation)
 * NOTE: Auth routes (Phase 2) đã được code sẵn nhưng chưa wire vào app.
 *       Wire vào khi triển khai Phase 2.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

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

// XSS Protection - Sẵn sàng cho Phase 2+
app.use((req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
});

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

// ========== API Routes (Phase 2) ==========
app.use('/api/auth', require('./modules/auth/auth.routes'));
// Thêm routes cho Phase 3+: thuoc, khachhang, nhacungcap, nhanvien, kho, banhang, taichinh, thongke

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
