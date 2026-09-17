/**
 * NhanVien Routes
 * Tất cả: Admin only
 *
 * Endpoints:
 *  GET    /api/nhan-vien                - Danh sách + filter
 *  GET    /api/nhan-vien/stats         - Thống kê tổng quan
 *  GET    /api/nhan-vien/:id           - Chi tiết NV
 *  GET    /api/nhan-vien/:id/hoa-don   - Lịch sử hóa đơn đã thanh toán
 *  POST   /api/nhan-vien               - Tạo mới
 *  PUT    /api/nhan-vien/:id           - Cập nhật
 *  DELETE /api/nhan-vien/:id           - Xóa
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./nhanVien.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { audit } = require('../../middleware/audit');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);
router.use(requireRole('Admin'));

router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/hoa-don', ctrl.getHoaDonByNV);
router.get('/:id/phieu-nhap', ctrl.getPhieuNhapByNV);

router.post('/', writeLimiter, audit('CREATE_NV'), ctrl.create);
router.put('/:id', writeLimiter, audit('UPDATE_NV'), ctrl.update);
router.delete('/:id', writeLimiter, audit('DELETE_NV'), ctrl.remove);

module.exports = router;
