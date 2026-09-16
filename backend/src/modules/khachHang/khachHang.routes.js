/**
 * KhachHang Routes
 *
 * Read: Admin + NV_BanHang (NV_Kho không được phép xem thông tin khách hàng theo RBAC matrix)
 * Write: Admin + NV_BanHang
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

// Read operations — Admin + NV_BanHang only (NV_Kho không được phép xem KH)
router.get('/', requireRole('Admin', 'NV_BanHang'), ctrl.getAll);
router.get('/stats', requireRole('Admin', 'NV_BanHang'), ctrl.getStats);
router.get('/:id', requireRole('Admin', 'NV_BanHang'), ctrl.getById);
router.get('/:id/hoa-don', requireRole('Admin', 'NV_BanHang'), ctrl.getHoaDonByKhachHang);

// Write operations — giới hạn theo role
router.post('/', writeLimiter, requireRole('Admin', 'NV_BanHang'), audit('CREATE_KH'), ctrl.create);
router.put('/:id', writeLimiter, requireRole('Admin', 'NV_BanHang'), audit('UPDATE_KH'), ctrl.update);
router.delete('/:id', writeLimiter, requireRole('Admin'), audit('DELETE_KH'), ctrl.remove);

module.exports = router;
