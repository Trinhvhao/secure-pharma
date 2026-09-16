/**
 * NhaCungCap Routes
 * Write: Admin only
 *
 * Endpoints:
 *  GET    /api/nha-cung-cap              - Danh sách + filter
 *  GET    /api/nha-cung-cap/stats       - Thống kê tổng quan
 *  GET    /api/nha-cung-cap/:id         - Chi tiết NCC
 *  GET    /api/nha-cung-cap/:id/phieu-nhap - Lịch sử phiếu nhập
 *  POST   /api/nha-cung-cap             - Tạo mới
 *  PUT    /api/nha-cung-cap/:id         - Cập nhật
 *  DELETE /api/nha-cung-cap/:id         - Xóa
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./nhaCungCap.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { audit } = require('../../middleware/audit');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);

// Stats + List + detail — public cho tất cả role đã login
router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/phieu-nhap', ctrl.getPhieuNhapByNCC);

// Write operations — chỉ Admin
router.post('/', writeLimiter, requireRole('Admin'), audit('CREATE_NCC'), ctrl.create);
router.put('/:id', writeLimiter, requireRole('Admin'), audit('UPDATE_NCC'), ctrl.update);
router.delete('/:id', writeLimiter, requireRole('Admin'), audit('DELETE_NCC'), ctrl.remove);

module.exports = router;
