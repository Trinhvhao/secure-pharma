const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const khoSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/kho/kho.service.js'),
    'utf8'
);
const thongKeSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/thongKe/thongKe.service.js'),
    'utf8'
);

test('average purchase price is weighted by remaining stock', () => {
    assert.match(
        khoSource,
        /SUM\(l\.SoLuongTonKho \* l\.GiaNhap\)[\s\S]*NULLIF\(SUM\(l\.SoLuongTonKho\), 0\)/
    );
});

test('warehouse health includes expired on-hand quantity', () => {
    assert.match(khoSource, /soLuongDaHetHan/);
    assert.match(khoSource, /l\.HanSD <= GETDATE\(\)/);
});

test('low-stock statistics aggregate by medicine before applying the threshold', () => {
    assert.match(
        thongKeSource,
        /GROUP BY l2\.MaThuoc[\s\S]*stock\.SoLuongTonKho > 0[\s\S]*stock\.SoLuongTonKho <= 10/
    );
});

