/**
 * Thuoc Routes
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./thuoc.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const { audit } = require('../../middleware/audit');
const { writeLimiter } = require('../../middleware/rateLimit');

router.use(authenticate);

// Read - All roles
router.get('/', ctrl.getAll);
router.get('/:id/similar', ctrl.getSimilar);
router.get('/:id', ctrl.getById);

// Write - Admin only
router.post('/', writeLimiter, requireRole('Admin'), audit('CREATE_THUOC'), ctrl.create);
router.put('/:id', writeLimiter, requireRole('Admin'), audit('UPDATE_THUOC'), ctrl.update);
router.delete('/:id', writeLimiter, requireRole('Admin'), audit('DELETE_THUOC'), ctrl.remove);

module.exports = router;
