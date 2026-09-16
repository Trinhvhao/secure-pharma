const test = require('node:test');
const assert = require('node:assert/strict');

const {
    normalizeCart,
    calculateInvoiceTotals,
} = require('../src/modules/banHang/banHang.logic');

test('duplicate medicines are merged before stock allocation', () => {
    assert.deepEqual(
        normalizeCart([
            { maThuoc: 7, soLuong: 2 },
            { maThuoc: 3, soLuong: 1 },
            { maThuoc: 7, soLuong: 3 },
        ]),
        [
            { maThuoc: 7, soLuong: 5 },
            { maThuoc: 3, soLuong: 1 },
        ]
    );
});

test('invoice discount is included in the authoritative amount due', () => {
    assert.deepEqual(
        calculateInvoiceTotals([
            { soLuong: 2, giaBan: 100000 },
            { soLuong: 1, giaBan: 50000 },
        ], 30000, 250000),
        {
            tamTinh: 250000,
            giamGia: 30000,
            tongTien: 220000,
            tienKhachDua: 250000,
            tienTraLai: 30000,
        }
    );
});

test('discount cannot exceed the subtotal', () => {
    assert.throws(
        () => calculateInvoiceTotals([{ soLuong: 1, giaBan: 10000 }], 10001, 10000),
        /không được vượt quá/i
    );
});

