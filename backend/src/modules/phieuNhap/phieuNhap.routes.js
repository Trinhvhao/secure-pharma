/**
 * PhieuNhap Routes - Phiếu nhập thuốc
 * Write (POST, PUT /:id/huy): Admin + NV_Kho
 * Read (GET): Admin + NV_Kho
 *
 * Audit log: Controller goi logAudit() truc tiep de co du MaPN, ChiTiet
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./phieuNhap.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { writeLimiter } = require('../../middleware/rateLimit');

// Tất cả route cần đăng nhập + là Admin hoặc NV_Kho
router.use(authenticate);
router.use(requireRole('Admin', 'NV_Kho'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', writeLimiter, ctrl.create);
router.put('/:id/huy', ctrl.cancel);

module.exports = router;
