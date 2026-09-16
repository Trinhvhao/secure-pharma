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
