/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const { authLimiter, writeLimiter } = require('../../middleware/rateLimit');

// Public routes
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authenticate, authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', writeLimiter, authenticate, authController.changePassword);

module.exports = router;
