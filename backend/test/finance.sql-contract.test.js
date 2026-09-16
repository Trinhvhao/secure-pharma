const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const phieuChiSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/phieuChi/phieuChi.service.js'),
    'utf8'
);
const thongKeSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/thongKe/thongKe.service.js'),
    'utf8'
);

test('cash-fund calculations use effective receipts instead of tendered cash', () => {
    assert.doesNotMatch(phieuChiSource, /SUM\(TienKhachDua\)/);
    assert.match(phieuChiSource, /SUM\(pt\.SoTien\)/);
    assert.match(phieuChiSource, /pt\.MaHD IS NULL OR hd\.TrangThai = N'DaThanhToan'/);
});

test('financial profit uses cost of sold lots', () => {
    assert.match(thongKeSource, /ChiTietHoaDon ct[\s\S]*ct\.SoLuongBan \* l\.GiaNhap/);
    assert.match(thongKeSource, /calculateFinanceSummary/);
});
