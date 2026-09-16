/**
 * Seed Script (LEGACY) - Đã được thay thế bởi scripts/migrate.js accounts
 *
 * File này được giữ lại để tương thích ngược với `npm run seed`,
 * nhưng nội dung đã được đồng bộ với scripts/migrate.js theo
 * naming-conventions.mdc (pattern: role.tên).
 *
 * Khuyến nghị: dùng `npm run db:setup` thay vì `npm run seed`.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

const SALT_ROUNDS = 10;

// Demo accounts theo .cursor/rules/naming-conventions.mdc
// Username: role.tên   |   Password: có ký tự đặc biệt + số + chữ hoa
const accounts = [
    {
        username: 'admin.huong',
        password: 'Admin@2026',
        role: 'Admin',
        maNV: 1,
        tenNV: 'Nguyễn Thị Hương'
    },
    {
        username: 'banhang.minh',
        password: 'BanHang@2026',
        role: 'NV_BanHang',
        maNV: 2,
        tenNV: 'Trần Văn Minh'
    },
    {
        username: 'banhang.lan',
        password: 'BanHang@2026',
        role: 'NV_BanHang',
        maNV: 3,
        tenNV: 'Lê Thị Lan'
    },
    {
        username: 'kho.cuong',
        password: 'Kho@2026',
        role: 'NV_Kho',
        maNV: 4,
        tenNV: 'Lê Văn Cường'
    }
];

async function seedAccounts() {
    console.log('🔄 Starting account seeding...');

    try {
        await db.testConnection();

        for (const account of accounts) {
            const existing = await db.query(
                'SELECT * FROM TaiKhoan WHERE TenDangNhap = @username',
                { username: account.username }
            );

            if (existing.recordset.length > 0) {
                console.log(`⏭️  Account '${account.username}' already exists, skipping...`);
                continue;
            }

            const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);

            await db.query(
                `INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, VaiTro, TrangThai, MaNV, TokenVersion)
                 VALUES (@username, @passwordHash, @role, @status, @maNV, 1)`,
                {
                    username: account.username,
                    passwordHash,
                    role: account.role,
                    status: 'HoatDong',
                    maNV: account.maNV
                }
            );

            console.log(`✅ Account '${account.username}' created (${account.role} - ${account.tenNV})`);
        }

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║                  Account Seeding Complete!                       ║');
        console.log('╠══════════════════════════════════════════════════════════════════╣');
        for (const acc of accounts) {
            console.log(`║  ${acc.username.padEnd(15)} │ ${acc.password.padEnd(14)} │ ${acc.role.padEnd(13)} ║`);
        }
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('💡 Tip: dùng `npm run db:setup` để setup DB + seed đầy đủ.');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        throw err;
    } finally {
        await db.closePool();
    }
}

seedAccounts()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    });
