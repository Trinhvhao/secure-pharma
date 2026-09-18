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

/**
 * Regression: ORDER BY không được tham chiếu alias sai (TonKho, MinHanSD)
 * vì MSSQL từ chối khi alias dẫn xuất từ subquery scalar + OFFSET/FETCH → 500.
 * Fix: phải viết lại biểu thức scalar subquery trong ORDER BY.
 */
async function captureItemsQuerySql(sort) {
    const queries = [];
    const responses = [
        { recordset: [{ total: 0 }] },
        { recordset: [{}] },
        { recordset: [] },
    ];
    const service = loadServiceWithQuery(async (sql) => {
        queries.push(sql);
        return responses[queries.length - 1];
    });
    await service.getAll({ sort });
    // Câu có ORDER BY + OFFSET là câu items (thứ 3)
    return queries[queries.length - 1] || '';
}

test('ton_desc ORDER BY uses scalar subquery expression, not alias', async () => {
    const sql = await captureItemsQuerySql('ton_desc');
    const orderBy = sql.match(/ORDER BY[\s\S]*?OFFSET/i)?.[0] || '';
    assert.match(
        orderBy,
        /ORDER BY\s+ISNULL\(\(\s*SELECT SUM\(l\.SoLuongTonKho\)/i,
        'ton_desc must reference the scalar expression, not an alias'
    );
    assert.doesNotMatch(
        orderBy,
        /\bTonKho\s+DESC/i,
        'ton_desc must NOT use the bad "TonKho" alias (causes SQL Server 500)'
    );
});

test('hsd_asc ORDER BY uses MIN(HanSD) scalar expression, not alias', async () => {
    const sql = await captureItemsQuerySql('hsd_asc');
    const orderBy = sql.match(/ORDER BY[\s\S]*?OFFSET/i)?.[0] || '';
    assert.match(
        orderBy,
        /ORDER BY\s+\(\s*SELECT MIN\(l\.HanSD\)/i,
        'hsd_asc must reference the MIN(HanSD) scalar expression, not an alias'
    );
    assert.doesNotMatch(
        orderBy,
        /\bMinHanSD\s+ASC/i,
        'hsd_asc must NOT use the bad "MinHanSD" alias (causes SQL Server 500)'
    );
});

test('ma_desc ORDER BY stays simple (sanity check)', async () => {
    const sql = await captureItemsQuerySql('ma_desc');
    const orderBy = sql.match(/ORDER BY[\s\S]*?OFFSET/i)?.[0] || '';
    assert.match(
        orderBy,
        /ORDER BY\s+t\.MaThuoc\s+DESC/i,
        'ma_desc must keep its plain column ORDER BY'
    );
});
