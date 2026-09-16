const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
    path.join(__dirname, '../src/modules/banHang/banHang.service.js'),
    'utf8'
);

test('checkout only allocates lots from received import receipts', () => {
    assert.match(source, /FROM PhieuNhap pn[\s\S]*INNER JOIN LoThuoc_ChiTietNhap[\s\S]*pn\.TrangThai = N'DaNhap'/);
});

test('checkout locks stock and guards every decrement from going negative', () => {
    assert.match(source, /begin\(db\.sql\.ISOLATION_LEVEL\.SERIALIZABLE\)/);
    assert.match(source, /WITH \(UPDLOCK, HOLDLOCK\)/);
    assert.match(source, /SoLuongTonKho >= @soLuong/);
});

test('invoice listing uses offset pagination without truncating later pages', () => {
    assert.doesNotMatch(source, /SELECT TOP \$\{safeLimit\}[\s\S]*ROW_NUMBER\(\)/);
    assert.match(source, /OFFSET \$\{offset\} ROWS FETCH NEXT \$\{safeLimit\} ROWS ONLY/);
});

test('invoice cancellation locks the invoice before restoring stock', () => {
    assert.match(source, /HoaDon WITH \(UPDLOCK, HOLDLOCK\)/);
});
