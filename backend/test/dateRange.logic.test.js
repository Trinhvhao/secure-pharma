const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildDateRange,
    previousDateRange,
    validateDateRange,
} = require('../src/modules/thongKe/dateRange.logic');

test('daily report range preserves requested calendar dates in local timezones', () => {
    const dates = buildDateRange('2026-09-01', '2026-09-03');
    assert.deepEqual(dates, ['2026-09-01', '2026-09-02', '2026-09-03']);
});

test('previous comparison period has the same inclusive length', () => {
    assert.deepEqual(previousDateRange('2026-09-01', '2026-09-16'), {
        fromDate: '2026-08-16',
        toDate: '2026-08-31',
    });
});

test('report range rejects reversed and excessively large ranges', () => {
    assert.throws(() => validateDateRange('2026-09-16', '2026-09-01'), /sau ngày kết thúc/i);
    assert.throws(() => validateDateRange('2020-01-01', '2026-09-01'), /366 ngày/i);
});

