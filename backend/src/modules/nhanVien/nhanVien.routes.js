/**
 * NhanVien Routes
 * Tất cả: Admin only
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

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', writeLimiter, audit('CREATE_NV'), ctrl.create);
router.put('/:id', writeLimiter, audit('UPDATE_NV'), ctrl.update);
router.delete('/:id', writeLimiter, audit('DELETE_NV'), ctrl.remove);

module.exports = router;
