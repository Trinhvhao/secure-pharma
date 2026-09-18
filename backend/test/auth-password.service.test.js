const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
let updateSql = '';
let updateCount = 0;

Module._load = function loadWithBoundaries(request, parent, isMain) {
    if (request === 'bcrypt') {
        return {
            compare: async (candidate) => candidate === 'Current@123',
            hash: async () => '<HASH>',
        };
    }
    if (request === '../../config/db' && parent?.filename?.endsWith('auth.service.js')) {
        return {
            query: async (sql) => {
                if (/SELECT MatKhauHash/.test(sql)) return { recordset: [{ MatKhauHash: '<HASH>' }] };
                updateSql = sql;
                updateCount += 1;
                return { recordset: [], rowsAffected: [1] };
            },
        };
    }
    return originalLoad.call(this, request, parent, isMain);
};

const authService = require('../src/modules/auth/auth.service');
Module._load = originalLoad;

test('change password rejects a weak new password', async () => {
    updateSql = '';
    updateCount = 0;

    const result = await authService.changePassword('nv.an', 'Current@123', 'abcdef');

    assert.equal(result.success, false);
    assert.match(result.message, /ít nhất 8 ký tự/);
    assert.equal(updateCount, 0);
});

test('change password clears the temporary-password requirement and revokes sessions', async () => {
    updateSql = '';
    updateCount = 0;

    const result = await authService.changePassword('nv.an', 'Current@123', 'NewStrong@123');

    assert.equal(result.success, true);
    assert.equal(updateCount, 1);
    assert.match(updateSql, /MustChangePassword\s*=\s*0/i);
    assert.match(updateSql, /TokenVersion\s*=\s*ISNULL\(TokenVersion, 1\) \+ 1/i);
});
