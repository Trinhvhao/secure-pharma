/**
 * RBAC Middleware - Role-Based Access Control
 */
const { forbidden } = require('../utils/response');

/**
 * Check if user has required role(s)
 * @param  {...string} allowedRoles - Allowed roles
 * @returns {Function} Middleware function
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        // Check if user exists (from auth middleware)
        if (!req.user) {
            return forbidden(res, 'Vui lòng đăng nhập');
        }

        // Check role
        if (!allowedRoles.includes(req.user.role)) {
            return forbidden(res, 'Bạn không có quyền thực hiện chức năng này');
        }

        next();
    };
}

/**
 * Check if user is admin
 */
function requireAdmin(req, res, next) {
    return requireRole('Admin')(req, res, next);
}

/**
 * Check if user is NV_BanHang or Admin
 */
function requireSeller(req, res, next) {
    return requireRole('Admin', 'NV_BanHang')(req, res, next);
}

/**
 * Check if user is the owner of the resource or admin
 * @param {Function} getOwnerId - Function to get owner ID from request
 */
function requireOwnerOrAdmin(getOwnerId) {
    return (req, res, next) => {
        if (!req.user) {
            return forbidden(res, 'Vui lòng đăng nhập');
        }

        // Admin can access everything
        if (req.user.role === 'Admin') {
            return next();
        }

        // Check if user owns the resource
        const ownerId = getOwnerId(req);
        if (ownerId === req.user.maNV) {
            return next();
        }

        return forbidden(res, 'Bạn không có quyền thực hiện thao tác này');
    };
}

module.exports = {
    requireRole,
    requireAdmin,
    requireSeller,
    requireOwnerOrAdmin
};
