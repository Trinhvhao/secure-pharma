const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateFinanceSummary } = require('../src/modules/phieuChi/finance.logic');

test('cash balance uses net invoice revenue, not cash tendered before change', () => {
    assert.deepEqual(
        calculateFinanceSummary({
            doanhThu: 1150000,
            tongChiPhieuChi: 655000,
            giaVonDaBan: 420000,
            giaTriNhapHang: 4560000,
        }),
        {
            tongThu: 1150000,
            tongChi: 655000,
            soDuTienMat: 495000,
            doanhThu: 1150000,
            giaVonDaBan: 420000,
            loiNhuanBanHang: 730000,
            giaTriNhapHang: 4560000,
        }
    );
});

