/**
 * Seed Script - Create accounts with hashed passwords
 * Run: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

const SALT_ROUNDS = 10;

// Default accounts
const accounts = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'Admin',
        maNV: 1
    },
    {
        username: 'nv1',
        password: 'nv123',
        role: 'NV_BanHang',
        maNV: 2
    },
    {
        username: 'nv2',
        password: 'nv123',
        role: 'NV_BanHang',
        maNV: 3
    }
];

async function seedAccounts() {
    console.log('🔄 Starting account seeding...');
    
    try {
        // Check database connection
        await db.testConnection();
        
        for (const account of accounts) {
            // Check if account exists
            const existing = await db.query(
                'SELECT * FROM TaiKhoan WHERE TenDangNhap = @username',
                { username: account.username }
            );
            
            if (existing.recordset.length > 0) {
                console.log(`⏭️  Account '${account.username}' already exists, skipping...`);
                continue;
            }
            
            // Hash password
            const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);
            
            // Insert account
            await db.query(
                `INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, VaiTro, TrangThai, MaNV)
                 VALUES (@username, @passwordHash, @role, @status, @maNV)`,
                {
                    username: account.username,
                    passwordHash: passwordHash,
                    role: account.role,
                    status: 'HoatDong',
                    maNV: account.maNV
                }
            );
            
            console.log(`✅ Account '${account.username}' created (password: ${account.password})`);
        }
        
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║              Account Seeding Complete!                    ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║  Username    │ Password  │ Role         │ Status        ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        for (const acc of accounts) {
            const status = 'HoatDong';
            console.log(`║  ${acc.username.padEnd(11)} │ ${acc.password.padEnd(9)} │ ${acc.role.padEnd(12)} │ ${status.padEnd(13)} ║`);
        }
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');
        
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        throw err;
    } finally {
        await db.closePool();
    }
}

// Run seed
seedAccounts()
    .then(() => {
        console.log('✅ Seed completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    });
