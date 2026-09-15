/**
 * Auth Service - Business logic cho authentication
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

const SALT_ROUNDS = 10;

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
    return jwt.sign(
        {
            sub: user.TenDangNhap,
            role: user.VaiTro,
            maNV: user.MaNV
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
}

/**
 * Login service
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} Result with success status and data
 */
async function login(username, password) {
    try {
        // Find user by username - DUNG PARAMETERIZED QUERY
        const result = await db.query(
            'SELECT * FROM TaiKhoan WHERE TenDangNhap = @username',
            { username }
        );
        
        const user = result.recordset[0];
        
        if (!user) {
            return { success: false, message: 'Tài khoản hoặc mật khẩu không đúng' };
        }
        
        // Check if account is locked
        if (user.TrangThai === 'Khoa') {
            return { success: false, message: 'Tài khoản đã bị khóa' };
        }
        
        // Check if account is locked due to failed attempts
        if (user.LockUntil && new Date(user.LockUntil) > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.LockUntil) - new Date()) / 60000);
            return { 
                success: false, 
                message: `Tài khoản bị khóa tạm thời. Vui lòng thử lại sau ${minutesLeft} phút` 
            };
        }
        
        // Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, user.MatKhauHash);
        
        if (!isValidPassword) {
            // Increment failed login count
            const failCount = (user.LoginFailCount || 0) + 1;
            let lockUntil = null;
            
            // Lock account after 5 failed attempts
            if (failCount >= 5) {
                const lockTime = new Date();
                lockTime.setMinutes(lockTime.getMinutes() + 15);
                lockUntil = lockTime;
            }
            
            await db.query(
                `UPDATE TaiKhoan 
                 SET LoginFailCount = @failCount, 
                     LockUntil = @lockUntil,
                     UpdatedAt = GETDATE()
                 WHERE TenDangNhap = @username`,
                { failCount, lockUntil: lockUntil ? lockUntil.toISOString() : null, username }
            );
            
            return { success: false, message: 'Tài khoản hoặc mật khẩu không đúng' };
        }
        
        // Reset failed login count on successful login
        await db.query(
            `UPDATE TaiKhoan 
             SET LoginFailCount = 0, 
                 LockUntil = NULL,
                 LastLogin = GETDATE(),
                 UpdatedAt = GETDATE()
             WHERE TenDangNhap = @username`,
            { username }
        );
        
        // Generate token
        const token = generateToken(user);
        
        // Get employee info
        const employeeResult = await db.query(
            'SELECT MaNV, TenNV, SDT, GioiTinh FROM NhanVien WHERE MaNV = @maNV',
            { maNV: user.MaNV }
        );
        const employee = employeeResult.recordset[0];
        
        return {
            success: true,
            data: {
                token,
                user: {
                    username: user.TenDangNhap,
                    role: user.VaiTro,
                    maNV: user.MaNV,
                    employee: employee ? {
                        maNV: employee.MaNV,
                        tenNV: employee.TenNV,
                        sdt: employee.SDT,
                        gioiTinh: employee.GioiTinh
                    } : null
                }
            }
        };
    } catch (err) {
        console.error('Login error:', err);
        return { success: false, message: 'Đã xảy ra lỗi khi đăng nhập' };
    }
}

/**
 * Get user info by MaNV
 * @param {number} maNV - Employee ID
 * @returns {Object} User info
 */
async function getUserInfo(maNV) {
    try {
        const result = await db.query(
            `SELECT tk.TenDangNhap, tk.VaiTro, tk.TrangThai,
                    nv.MaNV, nv.TenNV, nv.SDT, nv.GioiTinh, nv.NgayVaoLam
             FROM TaiKhoan tk
             JOIN NhanVien nv ON tk.MaNV = nv.MaNV
             WHERE tk.MaNV = @maNV`,
            { maNV }
        );
        
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Get user info error:', err);
        return null;
    }
}

/**
 * Change password
 * @param {string} username - Username
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Result
 */
async function changePassword(username, currentPassword, newPassword) {
    try {
        // Get current password hash
        const result = await db.query(
            'SELECT MatKhauHash FROM TaiKhoan WHERE TenDangNhap = @username',
            { username }
        );
        
        const user = result.recordset[0];
        
        if (!user) {
            return { success: false, message: 'Không tìm thấy tài khoản' };
        }
        
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.MatKhauHash);
        
        if (!isValid) {
            return { success: false, message: 'Mật khẩu hiện tại không đúng' };
        }
        
        // Hash new password
        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        // Update password
        await db.query(
            `UPDATE TaiKhoan 
             SET MatKhauHash = @newHash, 
                 UpdatedAt = GETDATE()
             WHERE TenDangNhap = @username`,
            { newHash, username }
        );
        
        return { success: true };
    } catch (err) {
        console.error('Change password error:', err);
        return { success: false, message: 'Đã xảy ra lỗi khi đổi mật khẩu' };
    }
}

/**
 * Refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} Result with new access token
 */
async function refreshToken(refreshToken) {
    try {
        // Verify refresh token (simplified - in production, store in DB)
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        // Get user from DB
        const result = await db.query(
            'SELECT * FROM TaiKhoan WHERE TenDangNhap = @username AND TrangThai = @status',
            { username: decoded.sub, status: 'HoatDong' }
        );
        
        const user = result.recordset[0];
        
        if (!user) {
            return { success: false, message: 'Invalid refresh token' };
        }
        
        // Generate new access token
        const token = generateToken(user);
        
        return {
            success: true,
            data: { token }
        };
    } catch (err) {
        return { success: false, message: 'Invalid or expired refresh token' };
    }
}

module.exports = {
    login,
    getUserInfo,
    changePassword,
    refreshToken,
    generateToken
};
