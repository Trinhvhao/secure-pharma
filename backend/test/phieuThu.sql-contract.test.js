const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const saleSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/banHang/banHang.service.js'),
    'utf8'
);
const migrationSource = fs.readFileSync(
    path.join(__dirname, '../database/14_patch_phieu_thu.sql'),
    'utf8'
);

test('sale receipt is inserted before the invoice transaction commits', () => {
    const insertPosition = saleSource.indexOf('INSERT INTO PhieuThu');
    const commitPosition = saleSource.indexOf('await transaction.commit()');
    assert.ok(insertPosition >= 0);
    assert.ok(commitPosition > insertPosition);
});

test('each invoice can have at most one linked receipt and backfill is idempotent', () => {
    assert.match(migrationSource, /CREATE UNIQUE INDEX UX_PhieuThu_MaHD/);
    assert.match(migrationSource, /WHERE MaHD IS NOT NULL/);
    assert.match(migrationSource, /NOT EXISTS \(SELECT 1 FROM PhieuThu pt WHERE pt\.MaHD = hd\.MaHD\)/);
});
