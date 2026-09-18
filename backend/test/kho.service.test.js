const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../src/config/db');
const servicePath = require.resolve('../src/modules/kho/kho.service');

function loadServiceWithQuery(query) {
    delete require.cache[servicePath];
    require.cache[dbPath] = {
        id: dbPath,
        filename: dbPath,
        loaded: true,
        exports: { query },
    };

    return require(servicePath);
}

test('low-stock warning excludes medicines that are already out of stock', async () => {
    let capturedSql = '';
    const service = loadServiceWithQuery(async (sql) => {
        capturedSql = sql;
        return { recordset: [] };
    });

    await service.getSapHetHang(10);
    assert.match(
        capturedSql,
        /stock\.SoLuongTonKho > 0\s+AND stock\.SoLuongTonKho <= @nguong/i,
        'low-stock must be greater than zero and at most the configured threshold'
    );
});

test('getLoByThuoc returns full lot fields for Admin and NV_Kho (no stripping)', async () => {
    const fakeLot = {
        MaLo: 1, MaThuoc: 5, TenThuoc: 'Paracetamol',
        MaPN: 10, SoLuongNhap: 100, SoLuongTonKho: 50,
        NgaySX: '2025-01-01', HanSD: '2027-01-01', SoNgayConLai: 365,
        GiaNhap: 12000, NgayNhap: '2026-01-15',
        MaNCC: 2, TenNCC: 'Cty Dược Hà Nội', TrangThai: 'DaNhap',
    };
    const service = loadServiceWithQuery(async () => ({ recordset: [fakeLot] }));

    const lots = await service.getLoByThuoc(5, 'Admin');
    assert.equal(lots.length, 1);
    assert.equal(lots[0].GiaNhap, 12000, 'Admin must see GiaNhap');
    assert.equal(lots[0].TenNCC, 'Cty Dược Hà Nội', 'Admin must see TenNCC');
    assert.equal(lots[0].MaPN, 10, 'Admin must see MaPN');
});

test('getLoByThuoc strips purchase-price / supplier fields for NV_BanHang (need-to-know)', async () => {
    const fakeLot = {
        MaLo: 1, MaThuoc: 5, TenThuoc: 'Paracetamol',
        MaPN: 10, SoLuongNhap: 100, SoLuongTonKho: 50,
        NgaySX: '2025-01-01', HanSD: '2027-01-01', SoNgayConLai: 365,
        GiaNhap: 12000, NgayNhap: '2026-01-15',
        MaNCC: 2, TenNCC: 'Cty Dược Hà Nội', TrangThai: 'DaNhap',
    };
    const service = loadServiceWithQuery(async () => ({ recordset: [fakeLot] }));

    const lots = await service.getLoByThuoc(5, 'NV_BanHang');
    assert.equal(lots.length, 1);

    // Fields NV_BanHang CẦN để bán hàng (FIFO): vẫn phải thấy
    assert.equal(lots[0].MaLo, 1);
    assert.equal(lots[0].MaThuoc, 5);
    assert.equal(lots[0].TenThuoc, 'Paracetamol');
    assert.equal(lots[0].SoLuongTonKho, 50);
    assert.equal(lots[0].SoLuongNhap, 100);
    assert.equal(lots[0].HanSD, '2027-01-01');
    assert.equal(lots[0].SoNgayConLai, 365);
    assert.equal(lots[0].NgaySX, '2025-01-01');

    // Fields NHẠY CẢM phải bị strip
    assert.equal(lots[0].GiaNhap, undefined, 'NV_BanHang must NOT see GiaNhap');
    assert.equal(lots[0].MaPN, undefined, 'NV_BanHang must NOT see MaPN');
    assert.equal(lots[0].NgayNhap, undefined, 'NV_BanHang must NOT see NgayNhap');
    assert.equal(lots[0].MaNCC, undefined, 'NV_BanHang must NOT see MaNCC');
    assert.equal(lots[0].TenNCC, undefined, 'NV_BanHang must NOT see TenNCC');
    assert.equal(lots[0].TrangThai, undefined, 'NV_BanHang must NOT see TrangThai');
});
