/**
 * Kho Routes - Tồn kho + cảnh báo
 * Read: All roles
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./kho.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);

router.get('/thong-ke-tong', requireRole('Admin', 'NV_Kho'), ctrl.getThongKeTong);
router.get('/ton-kho', ctrl.getTonKho);
router.get('/sap-het-hang', ctrl.getSapHetHang);
router.get('/sap-het-han', ctrl.getSapHetHan);
router.get('/dieu-chinh', requireRole('Admin', 'NV_Kho'), ctrl.getDieuChinhList);
router.get('/lo/:maThuoc', ctrl.getLoByThuoc);
router.patch('/lo/:maLo/ton-kho', writeLimiter, requireRole('Admin', 'NV_Kho'), ctrl.adjustLotStock);

module.exports = router;
