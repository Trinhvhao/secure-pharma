const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const moduleName of ['khachHang', 'nhaCungCap']) {
    test(`${moduleName} segment filters operate on CTE columns and count the filtered result`, () => {
        const source = fs.readFileSync(
            path.join(__dirname, `../src/modules/${moduleName}/${moduleName}.service.js`),
            'utf8'
        );
        assert.doesNotMatch(source, /SELECT \* FROM (KhStats|NccStats)\s*\$\{havingSql\}/);
        assert.match(source, /SELECT COUNT\(\*\) AS total FROM (KhStats|NccStats)[\s\S]*segmentWhereSql/);
    });
}

