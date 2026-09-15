/**
 * ============================================================
 * MIGRATION SCRIPT - Auto Setup Database
 * ============================================================
 *
 * Mục đích: Tự động tạo database, tables, và seed data
 *           mà KHÔNG CẦN mở SSMS.
 *
 * Cách dùng:
 *   cd backend
 *   npm run db:setup       # Tạo DB + tables + seed data (an toàn, idempotent)
 *   npm run db:reset       # Xóa toàn bộ DB và tạo lại (NGUY HIỂM!)
 *   npm run db:seed        # Chỉ insert seed data (nếu tables đã tồn tại)
 *   npm run db:status      # Xem trạng thái hiện tại
 *
 * Lần đầu chạy:
 *   1. Sửa DB_PASSWORD trong .env
 *   2. Chạy: npm run db:setup
 *   3. Server sẽ tự động kết nối được sau khi setup xong
 * ============================================================
 */

require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Config từ .env - Hỗ trợ cả Windows Auth và SQL Auth
const buildConfig = (databaseName) => {
    const config = {
        server: process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT) || 1433,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: true,
            enableArithAbort: true,
            connectionTimeout: 30000,
            requestTimeout: 30000,
        },
    };

    if (databaseName) {
        config.database = databaseName;
    }

    if (process.env.DB_TRUSTED_CONNECTION === 'true') {
        // Windows Authentication
        config.options.trustedConnection = true;
        console.log('   🔐 Sử dụng: Windows Authentication');
    } else {
        // SQL Server Authentication
        config.user = process.env.DB_USER || 'sa';
        config.password = process.env.DB_PASSWORD;
        console.log(`   🔐 Sử dụng: SQL Server Auth (user: ${config.user})`);
    }

    return config;
};

const getMasterConfig = () => buildConfig('master');
const getTargetConfig = () => buildConfig(process.env.DB_NAME || 'SecurePharmaDB');

// ====================== HELPER FUNCTIONS ======================

/**
 * Tách file SQL thành các batch (phân cách bởi GO)
 */
function splitSqlBatches(sqlContent) {
    // Loại bỏ comments kiểu -- và /* */
    const cleaned = sqlContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .split('\n')
        .map(line => {
            const idx = line.indexOf('--');
            return idx >= 0 ? line.substring(0, idx) : line;
        })
        .join('\n');

    // Tách theo GO (case insensitive, đứng 1 mình 1 dòng)
    const batches = cleaned
        .split(/^\s*GO\s*$/gim)
        .map(b => b.trim())
        .filter(b => b.length > 0);

    return batches;
}

/**
 * Chạy 1 batch SQL
 */
async function executeBatch(poolInstance, batch, description = '') {
    try {
        if (description) console.log(`   → ${description}`);
        await poolInstance.request().batch(batch);
    } catch (err) {
        console.error(`   ❌ Failed: ${description || ''}`);
        console.error(`   Error: ${err.message}`);
        throw err;
    }
}

// ====================== MIGRATION FUNCTIONS ======================

/**
 * 1. Tạo database nếu chưa có
 */
async function createDatabase() {
    const dbName = process.env.DB_NAME || 'SecurePharmaDB';
    console.log(`\n📦 [1/4] Tạo database "${dbName}"...`);

    let pool;
    try {
        pool = await sql.connect(getMasterConfig());

        // Kiểm tra DB đã tồn tại chưa
        const result = await pool.request()
            .input('dbName', sql.NVarChar, dbName)
            .query(`SELECT name FROM sys.databases WHERE name = @dbName`);

        if (result.recordset.length > 0) {
            console.log(`   ✅ Database "${dbName}" đã tồn tại, bỏ qua.`);
        } else {
            await pool.request().batch(`CREATE DATABASE [${dbName}];`);
            console.log(`   ✅ Đã tạo database "${dbName}".`);
        }
    } catch (err) {
        console.error(`   ❌ Lỗi tạo database: ${err.message}`);
        throw err;
    } finally {
        if (pool) await pool.close();
    }
}

/**
 * 2. Tạo bảng từ file 01_create_tables.sql
 */
async function createTables() {
    console.log(`\n🔨 [2/4] Tạo các bảng...`);

    const sqlFile = path.join(__dirname, '..', '..', 'database', '01_create_tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    const batches = splitSqlBatches(sqlContent);

    let pool;
    try {
        pool = await sql.connect(getTargetConfig());

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            // Bỏ qua batch CREATE DATABASE (đã tạo ở bước 1)
            if (/CREATE\s+DATABASE/i.test(batch)) continue;
            if (/USE\s+SecurePharmaDB/i.test(batch)) continue;

            await executeBatch(pool, batch, `Batch ${i + 1}/${batches.length}`);
        }

        console.log(`   ✅ Đã chạy ${batches.length} batch(es) - bảng đã được tạo/cập nhật.`);
    } catch (err) {
        console.error(`   ❌ Lỗi tạo bảng: ${err.message}`);
        throw err;
    } finally {
        if (pool) await pool.close();
    }
}

/**
 * 3. Seed data từ file 02_seed_data.sql
 */
async function seedData() {
    console.log(`\n🌱 [3/4] Seed dữ liệu mẫu...`);

    const sqlFile = path.join(__dirname, '..', '..', 'database', '02_seed_data.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    const batches = splitSqlBatches(sqlContent);

    let pool;
    try {
        pool = await sql.connect(getTargetConfig());

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            if (/USE\s+SecurePharmaDB/i.test(batch)) continue;

            await executeBatch(pool, batch, `Batch ${i + 1}/${batches.length}`);
        }

        console.log(`   ✅ Seed data hoàn tất.`);
    } catch (err) {
        console.error(`   ❌ Lỗi seed: ${err.message}`);
        throw err;
    } finally {
        if (pool) await pool.close();
    }
}

/**
 * 4. Seed accounts (sau khi có bảng TaiKhoan và NhanVien)
 * Tạo 3 tài khoản demo: admin, nv1, nv2
 */
async function seedAccounts() {
    console.log(`\n👤 [4/4] Tạo tài khoản demo...`);

    const bcrypt = require('bcrypt');

    let pool;
    try {
        pool = await sql.connect(getTargetConfig());

        // Hash passwords
        const hashAdmin = await bcrypt.hash('admin123', 10);
        const hashNV1 = await bcrypt.hash('nv123', 10);
        const hashNV2 = await bcrypt.hash('nv123', 10);

        // Xóa tài khoản cũ nếu có (để idempotent)
        await pool.request().query(`DELETE FROM TaiKhoan WHERE TenDangNhap IN ('admin', 'nv1', 'nv2')`);

        // Tạo accounts - tham chiếu MaNV = 1 (admin), 2 (nv1), 3 (nv2) từ seed NhanVien
        await pool.request()
            .input('admin', sql.VarChar, 'admin')
            .input('adminHash', sql.NVarChar, hashAdmin)
            .input('nv1', sql.VarChar, 'nv1')
            .input('nv1Hash', sql.NVarChar, hashNV1)
            .input('nv2', sql.VarChar, 'nv2')
            .input('nv2Hash', sql.NVarChar, hashNV2)
            .query(`
                INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, VaiTro, TrangThai, MaNV) VALUES
                ('admin', @adminHash, N'Admin', N'HoatDong', 1),
                ('nv1',   @nv1Hash,   N'NV_BanHang', N'HoatDong', 2),
                ('nv2',   @nv2Hash,   N'NV_BanHang', N'HoatDong', 3)
            `);

        console.log(`   ✅ Đã tạo 3 tài khoản:`);
        console.log(`      - admin / admin123 (Admin)`);
        console.log(`      - nv1   / nv123    (NV_BanHang)`);
        console.log(`      - nv2   / nv123    (NV_BanHang)`);
    } catch (err) {
        console.error(`   ❌ Lỗi tạo tài khoản: ${err.message}`);
        throw err;
    } finally {
        if (pool) await pool.close();
    }
}

/**
 * Kiểm tra trạng thái database
 */
async function checkStatus() {
    console.log(`\n📊 KIỂM TRA TRẠNG THÁI DATABASE`);
    console.log(`═══════════════════════════════════════════`);
    console.log(`Server: ${process.env.DB_SERVER}:${process.env.DB_PORT || 1433}`);
    console.log(`Database: ${process.env.DB_NAME || 'SecurePharmaDB'}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`═══════════════════════════════════════════`);

    let pool;
    try {
        pool = await sql.connect(getTargetConfig());

        // Kiểm tra kết nối
        console.log(`\n✅ Kết nối thành công`);

        // Đếm bảng
        const tables = await pool.request().query(`
            SELECT TABLE_NAME as name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        console.log(`\n📋 Số bảng: ${tables.recordset.length}/12`);
        if (tables.recordset.length > 0) {
            console.log(`   Danh sách:`);
            tables.recordset.forEach(t => console.log(`   - ${t.name}`));
        }

        // Đếm dữ liệu
        const counts = await pool.request().query(`
            SELECT
                (SELECT COUNT(*) FROM DanhMuc) AS DanhMuc,
                (SELECT COUNT(*) FROM NhaCungCap) AS NhaCungCap,
                (SELECT COUNT(*) FROM NhanVien) AS NhanVien,
                (SELECT COUNT(*) FROM Thuoc) AS Thuoc,
                (SELECT COUNT(*) FROM KhachHang) AS KhachHang,
                (SELECT COUNT(*) FROM TaiKhoan) AS TaiKhoan
        `);
        const r = counts.recordset[0];
        console.log(`\n📊 Dữ liệu:`);
        console.log(`   DanhMuc:    ${r.DanhMuc} dòng`);
        console.log(`   NhaCungCap: ${r.NhaCungCap} dòng`);
        console.log(`   NhanVien:   ${r.NhanVien} dòng`);
        console.log(`   Thuoc:      ${r.Thuoc} dòng`);
        console.log(`   KhachHang:  ${r.KhachHang} dòng`);
        console.log(`   TaiKhoan:   ${r.TaiKhoan} dòng`);

    } catch (err) {
        console.error(`\n❌ Lỗi: ${err.message}`);
        process.exit(1);
    } finally {
        if (pool) await pool.close();
    }
}

/**
 * RESET - Xóa toàn bộ database và tạo lại (NGUY HIỂM)
 */
async function resetDatabase() {
    const dbName = process.env.DB_NAME || 'SecurePharmaDB';
    console.log(`\n⚠️  RESET DATABASE - XÓA TOÀN BỘ DỮ LIỆU!`);
    console.log(`Database: ${dbName}`);

    // Hỏi xác nhận
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    await new Promise(resolve => {
        readline.question(`\nBạn có chắc muốn XÓA database "${dbName}"? (yes/no): `, answer => {
            readline.close();
            if (answer.toLowerCase() !== 'yes') {
                console.log(`❌ Đã hủy.`);
                process.exit(0);
            }
            resolve();
        });
    });

    let pool;
    try {
        pool = await sql.connect(getMasterConfig());

        // Ngắt tất cả kết nối
        await pool.request().query(`
            ALTER DATABASE [${dbName}]
            SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        `);

        // Drop database
        await pool.request().query(`DROP DATABASE [${dbName}];`);
        console.log(`   ✅ Đã xóa database "${dbName}"`);

        // Tạo lại từ đầu
        await createDatabase();
        await createTables();
        await seedData();
        await seedAccounts();

        console.log(`\n✅ RESET HOÀN TẤT!`);
    } catch (err) {
        console.error(`❌ Lỗi: ${err.message}`);
        process.exit(1);
    } finally {
        if (pool) await pool.close();
    }
}

// ====================== MAIN ENTRY ======================

async function main() {
    const action = process.argv[2] || 'setup';

    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║       SECUREPHARMA - DATABASE MIGRATION TOOL             ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);

    try {
        switch (action) {
            case 'setup':
                // Setup đầy đủ: tạo DB + tables + seed + accounts
                await createDatabase();
                await createTables();
                await seedData();
                await seedAccounts();
                console.log(`\n${'═'.repeat(60)}`);
                console.log(`✅ SETUP HOÀN TẤT!`);
                console.log(`${'═'.repeat(60)}`);
                console.log(`\n📝 Bước tiếp theo:`);
                console.log(`   cd d:/LibraryCode/SecurePharma/backend`);
                console.log(`   npm start`);
                console.log(`\n🔑 Tài khoản demo:`);
                console.log(`   admin / admin123   (Admin)`);
                console.log(`   nv1   / nv123      (NV_BanHang)`);
                console.log(`   nv2   / nv123      (NV_BanHang)`);
                break;

            case 'tables':
                // Chỉ tạo tables (giả định DB đã có)
                await createTables();
                console.log(`\n✅ Tạo bảng hoàn tất!`);
                break;

            case 'seed':
                // Chỉ seed data
                await seedData();
                console.log(`\n✅ Seed data hoàn tất!`);
                break;

            case 'accounts':
                // Chỉ tạo accounts
                await seedAccounts();
                console.log(`\n✅ Tạo accounts hoàn tất!`);
                break;

            case 'status':
                await checkStatus();
                break;

            case 'reset':
                await resetDatabase();
                break;

            default:
                console.log(`\n❌ Unknown action: ${action}`);
                console.log(`\nUsage:`);
                console.log(`   node migrate.js setup      # Tạo DB + tables + seed + accounts`);
                console.log(`   node migrate.js tables     # Chỉ tạo tables`);
                console.log(`   node migrate.js seed       # Chỉ seed data`);
                console.log(`   node migrate.js accounts   # Chỉ tạo accounts`);
                console.log(`   node migrate.js status     # Xem trạng thái`);
                console.log(`   node migrate.js reset      # Xóa và tạo lại từ đầu`);
                process.exit(1);
        }
    } catch (err) {
        console.error(`\n❌ Migration thất bại: ${err.message}`);
        process.exit(1);
    }

    // Đóng tất cả connection
    await sql.close();
    process.exit(0);
}

main();
