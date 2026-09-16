/**
 * ThongKe Routes - 3 dashboard
 *  - /kho        [All]     tồn kho + cảnh báo
 *  - /hoa-don    [All]     doanh thu + top thuốc
 *  - /tai-chinh  [Admin]   tổng thu/chi/lợi nhuận (Admin check trong routes)
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./thongKe.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

router.use(authenticate);

// All roles
router.get('/kho', ctrl.getKho);
router.get('/hoa-don', ctrl.getHoaDon);

// Admin only
router.get('/tai-chinh', requireRole('Admin'), ctrl.getTaiChinh);

module.exports = router;
