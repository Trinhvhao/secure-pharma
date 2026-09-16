const express = require('express');
const router = express.Router();
const controller = require('./phieuThu.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);
router.use(requireRole('Admin', 'NV_BanHang'));
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', writeLimiter, controller.create);

module.exports = router;
