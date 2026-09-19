const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const jwt = require('jsonwebtoken');

const TEST_SECRET = 'admin-routes-auth-test-secret';

function mockController(modulePath, handlers) {
    const resolvedPath = require.resolve(modulePath);
    require.cache[resolvedPath] = {
        id: resolvedPath,
        filename: resolvedPath,
        loaded: true,
        exports: handlers,
    };
}

function ok(req, res) {
    res.status(200).json({ role: req.user?.role || null });
}

async function request(app, path, role) {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    try {
        const { port } = server.address();
        const headers = {};
        if (role) {
            headers.Authorization = `Bearer ${jwt.sign({
                sub: 'manager-test',
                role,
                maNV: 1,
                type: 'access',
            }, TEST_SECRET, { expiresIn: '1m' })}`;
        }

        return await fetch(`http://127.0.0.1:${port}${path}`, { headers });
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
}

test('Audit Log xác thực token trước khi kiểm tra quyền Quản lý', async () => {
    process.env.JWT_SECRET = TEST_SECRET;
    mockController('../src/modules/auditLog/auditLog.controller', {
        getAuditLogs: ok,
        getAuditStats: ok,
        getActionTypes: ok,
        getTableNames: ok,
        getAuditLogById: ok,
    });
    delete require.cache[require.resolve('../src/modules/auditLog/auditLog.routes')];

    const app = express();
    app.use('/api/audit-log', require('../src/modules/auditLog/auditLog.routes'));

    const response = await request(app, '/api/audit-log/stats', 'Quản lý');

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { role: 'Quản lý' });
});
test('System Config xác thực token trước khi kiểm tra quyền Quản lý', async () => {
    process.env.JWT_SECRET = TEST_SECRET;
    mockController('../src/modules/systemConfig/systemConfig.controller', {
        getAll: ok,
        getOne: ok,
        setOne: ok,
        setMany: ok,
        removeOne: ok,
    });
    delete require.cache[require.resolve('../src/modules/systemConfig/systemConfig.routes')];

    const app = express();
    app.use('/api/system-config', require('../src/modules/systemConfig/systemConfig.routes'));

    const response = await request(app, '/api/system-config', 'Quản lý');

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { role: 'Quản lý' });
});
