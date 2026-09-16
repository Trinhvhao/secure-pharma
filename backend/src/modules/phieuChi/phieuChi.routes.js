/**
 * PhieuChi Routes - Admin only
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./phieuChi.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { writeLimiter } = require('../../middleware/rateLimit');

// Tất cả route cần đăng nhập + Admin
router.use(authenticate);
router.use(requireRole('Admin'));

router.get('/', ctrl.getAll);
router.get('/stats', ctrl.getStats);  // Stats cho TaiChinh page - đặt trước /:id
router.get('/so-du', ctrl.getSoDu);
router.get('/:id', ctrl.getById);
router.post('/', writeLimiter, ctrl.create);

module.exports = router;
