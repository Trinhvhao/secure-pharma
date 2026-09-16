/**
 * DanhMuc Routes
 *  - Public (authenticated): GET
 *  - Admin only: POST, PUT, DELETE
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./danhMuc.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { audit } = require('../../middleware/audit');
const { writeLimiter } = require('../../middleware/rateLimit');

// Tất cả route đều cần đăng nhập
router.use(authenticate);

// Read - tất cả role
router.get('/', ctrl.getAll);
router.get('/:maDM', ctrl.getById);

// Write - chỉ Admin
router.post('/', writeLimiter, requireRole('Admin'), audit('CREATE_DANHMUC'), ctrl.create);
router.put('/:maDM', writeLimiter, requireRole('Admin'), audit('UPDATE_DANHMUC'), ctrl.update);
router.delete('/:maDM', writeLimiter, requireRole('Admin'), audit('DELETE_DANHMUC'), ctrl.remove);

module.exports = router;
