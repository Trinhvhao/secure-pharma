const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
    path.join(__dirname, '../src/modules/phieuNhap/phieuNhap.service.js'),
    'utf8'
);

test('receipt cancellation locks the receipt and its lots in one serializable transaction', () => {
    assert.match(source, /begin\(db\.sql\.ISOLATION_LEVEL\.SERIALIZABLE\)/);
    assert.match(source, /PhieuNhap WITH \(UPDLOCK, HOLDLOCK\)/);
    assert.match(source, /LoThuoc_ChiTietNhap[\s\S]*WITH \(UPDLOCK, HOLDLOCK\)/);
});

