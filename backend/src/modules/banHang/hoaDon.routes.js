/**
 * HoaDon Routes - Resource chính cho hóa đơn
 *
 *  GET  /             — Danh sách (All authenticated)
 *  GET  /:id          — Chi tiết (All authenticated)
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

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.put('/:id/huy', writeLimiter, requireRole('Admin'), ctrl.cancel);

module.exports = router;
