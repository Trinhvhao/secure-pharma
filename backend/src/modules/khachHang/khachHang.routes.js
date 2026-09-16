/**
 * KhachHang Routes
 *
 * Write: Admin + NV_BanHang (theo ma trận phân quyền)
 * Read: All roles (stats, detail, history đều public với tài khoản đã đăng nhập)
 *
 * Endpoints:
 *  GET    /api/khach-hang              - Danh sách + filter
 *  GET    /api/khach-hang/stats       - Thống kê tổng quan
 *  GET    /api/khach-hang/:id         - Chi tiết KH
 *  GET    /api/khach-hang/:id/hoa-don - Lịch sử hóa đơn
 *  POST   /api/khach-hang             - Tạo mới
 *  PUT    /api/khach-hang/:id         - Cập nhật
 *  DELETE /api/khach-hang/:id         - Xóa
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./khachHang.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { audit } = require('../../middleware/audit');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);

// Stats — public cho tất cả role đã login
router.get('/stats', ctrl.getStats);

// List + detail — public cho tất cả role
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/hoa-don', ctrl.getHoaDonByKhachHang);

// Write operations — giới hạn theo role
router.post('/', writeLimiter, requireRole('Admin', 'NV_BanHang'), audit('CREATE_KH'), ctrl.create);
router.put('/:id', writeLimiter, requireRole('Admin', 'NV_BanHang'), audit('UPDATE_KH'), ctrl.update);
router.delete('/:id', writeLimiter, requireRole('Admin'), audit('DELETE_KH'), ctrl.remove);

module.exports = router;
