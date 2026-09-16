/**
 * BanHang Routes - Action "bán hàng"
 *
 *  POST /api/ban-hang  — Tạo hóa đơn mới + trừ tồn kho (Admin, NV_BanHang)
 *
 * Tách riêng khỏi hoaDon.routes.js vì:
 *  - /api/ban-hang là ACTION (verb-like)
 *  - /api/hoa-don là RESOURCE (collection of invoices)
 *  - Tách ra tránh nhầm lẫn REST: 1 URL = 1 resource
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./banHang.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);

router.post('/', writeLimiter, requireRole('Admin', 'NV_BanHang'), ctrl.create);

module.exports = router;
