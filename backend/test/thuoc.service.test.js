const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../src/config/db');
const servicePath = require.resolve('../src/modules/thuoc/thuoc.service');

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

test('stock chip counts remain global when one stock status is selected', async () => {
    const queries = [];
    const responses = [
        { recordset: [{ total: 1 }] },
        { recordset: [{ inStock: 12, low: 4, outStock: 1 }] },
        { recordset: [] },
    ];
    const service = loadServiceWithQuery(async (sql, params) => {
        queries.push({ sql, params });
        return responses[queries.length - 1];
    });

    const result = await service.getAll({ trangThaiTon: 'out' });
    const countsSqlAfterFrom = queries[1].sql.split('FROM Thuoc t')[1];

    assert.doesNotMatch(
        countsSqlAfterFrom,
        /\bWHERE\b/i,
        'the counts query must not inherit the selected stock-status filter'
    );
    assert.deepEqual(result.counts, { inStock: 12, low: 4, out: 1 });
});

test('in-stock filter excludes the low-stock range', async () => {
    const queries = [];
    const responses = [
        { recordset: [{ total: 12 }] },
        { recordset: [{ inStock: 12, low: 4, outStock: 1 }] },
        { recordset: [] },
    ];
    const service = loadServiceWithQuery(async (sql, params) => {
        queries.push({ sql, params });
        return responses[queries.length - 1];
    });

    await service.getAll({ trangThaiTon: 'inStock' });
    const countSqlAfterFrom = queries[0].sql.split('FROM Thuoc t')[1];

    assert.match(
        countSqlAfterFrom,
        /\), 0\)\) > 10/,
        'in-stock must mean more than 10 units so it cannot overlap low-stock'
    );
});
