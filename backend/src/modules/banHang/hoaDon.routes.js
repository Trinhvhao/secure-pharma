/**
 * HoaDon Routes - Resource chính cho hóa đơn
 *
 *  GET  /             — Danh sách (Admin, NV_BanHang)
 *  GET  /:id          — Chi tiết (Admin, NV_BanHang)
 *  PUT  /:id/huy      — Hủy hóa đơn (Admin only)
 *
 * POST /api/ban-hang (action) vẫn ở banHang.routes.js vì là action riêng
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./banHang.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);

// Read — Admin + NV_BanHang only (NV_Kho không được phép xem hóa đơn theo RBAC matrix)
router.get('/', requireRole('Admin', 'NV_BanHang'), ctrl.getAll);
router.get('/:id', requireRole('Admin', 'NV_BanHang'), ctrl.getById);

router.put('/:id/huy', writeLimiter, requireRole('Admin'), ctrl.cancel);

module.exports = router;
