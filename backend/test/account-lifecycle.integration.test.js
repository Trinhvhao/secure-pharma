const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
const state = {
    employee: { MaNV: 7, TenNV: 'Nguyễn Văn An', TrangThai: 'DangLam' },
    account: null,
};

const fakeDb = {
    query: async (sql, params = {}) => {
        if (/SELECT MaNV, TenNV, TrangThai FROM NhanVien/i.test(sql)) {
            return { recordset: state.employee && state.employee.MaNV === params.maNV ? [state.employee] : [] };
        }
        if (/SELECT TenDangNhap, VaiTro FROM TaiKhoan WHERE MaNV/i.test(sql)) {
            return { recordset: state.account && state.account.MaNV === params.maNV ? [state.account] : [] };
        }
        if (/SELECT TenDangNhap FROM TaiKhoan WHERE TenDangNhap/i.test(sql)) {
            return { recordset: state.account?.TenDangNhap === params.username ? [state.account] : [] };
        }
        if (/INSERT INTO TaiKhoan/i.test(sql)) {
            state.account = {
                TenDangNhap: params.tenDangNhap,
                MatKhauHash: params.matKhauHash,
                VaiTro: params.vaiTro,
                TrangThai: params.trangThai,
                MaNV: params.maNV,
                LoginFailCount: 0,
                LockUntil: null,
                TokenVersion: 1,
                MustChangePassword: /MustChangePassword/i.test(sql),
            };
            return { recordset: [state.account], rowsAffected: [1] };
        }
        if (/SELECT TenDangNhap FROM TaiKhoan WHERE MaNV/i.test(sql)) {
            return { recordset: state.account && state.account.MaNV === params.maNV ? [state.account] : [] };
        }
        if (/UPDATE TaiKhoan[\s\S]*MatKhauHash/i.test(sql) && params.maNV) {
            state.account.MatKhauHash = params.matKhauHash;
            state.account.TokenVersion += 1;
            if (/LoginFailCount\s*=\s*0/i.test(sql)) state.account.LoginFailCount = 0;
            if (/LockUntil\s*=\s*NULL/i.test(sql)) state.account.LockUntil = null;
            if (/MustChangePassword\s*=\s*1/i.test(sql)) state.account.MustChangePassword = true;
            return { recordset: [], rowsAffected: [1] };
        }
        if (/FROM TaiKhoan/i.test(sql) && params.username) {
            if (!state.account || state.account.TenDangNhap !== params.username) return { recordset: [] };
            return {
                recordset: [{
                    ...state.account,
                    NhanVienTrangThai: state.employee.TrangThai,
                }],
            };
        }
        if (/UPDATE TaiKhoan/i.test(sql) && params.username) {
            if (/LoginFailCount\s*=\s*0/i.test(sql)) state.account.LoginFailCount = 0;
            if (/LockUntil\s*=\s*NULL/i.test(sql)) state.account.LockUntil = null;
            return { recordset: [], rowsAffected: [1] };
        }
        if (/FROM NhanVien WHERE MaNV/i.test(sql)) {
            return { recordset: [state.employee] };
        }
        throw new Error(`Unexpected SQL in account lifecycle test: ${sql}`);
    },
};

Module._load = function loadWithBoundaries(request, parent, isMain) {
    if (request === 'bcrypt') {
        return {
            hash: async (password) => `hash:${password}`,
            compare: async (password, hash) => hash === `hash:${password}`,
        };
    }
    if (request === '../../config/db' && /(?:nhanVien|auth)\.service\.js$/.test(parent?.filename || '')) {
        return fakeDb;
    }
    return originalLoad.call(this, request, parent, isMain);
};

const nhanVienController = require('../src/modules/nhanVien/nhanVien.controller');
const authService = require('../src/modules/auth/auth.service');
Module._load = originalLoad;

function invoke(handler, req) {
    return new Promise((resolve, reject) => {
        const res = {
            status(code) { this.statusCode = code; return this; },
            json(body) { resolve({ status: this.statusCode, body }); return this; },
        };
        handler(req, res, reject);
    });
}

function existingAccount(overrides = {}) {
    return {
        TenDangNhap: 'nv.an',
        MatKhauHash: 'hash:Current@123',
        VaiTro: 'NV_BanHang',
        TrangThai: 'HoatDong',
        MaNV: 7,
        LoginFailCount: 0,
        LockUntil: null,
        TokenVersion: 1,
        MustChangePassword: false,
        ...overrides,
    };
}

test('admin can provision an existing employee with an auto-generated password', async () => {
    state.account = null;

    const response = await invoke(nhanVienController.createAccount, {
        user: { maNV: 1, role: 'Admin' },
        params: { id: '7' },
        body: {
            tenDangNhap: 'nv.an',
            vaiTro: 'NV_BanHang',
            trangThai: 'HoatDong',
            autoPassword: true,
        },
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.taiKhoan.TenDangNhap, 'nv.an');
    assert.equal(response.body.data.matKhauTam.length, 12);
    assert.equal(state.account.MustChangePassword, true);
});

test('admin cannot reset their own password through the employee-management endpoint', async () => {
    state.account = existingAccount();
    const oldHash = state.account.MatKhauHash;

    const response = await invoke(nhanVienController.resetPassword, {
        user: { maNV: 7, role: 'Admin' },
        params: { id: '7' },
        body: {},
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(state.account.MatKhauHash, oldHash);
});

test('reset password clears temporary lockout and requires a password change after login', async () => {
    state.account = existingAccount({
        LoginFailCount: 5,
        LockUntil: new Date(Date.now() + 15 * 60 * 1000),
    });

    const response = await invoke(nhanVienController.resetPassword, {
        user: { maNV: 1, role: 'Admin' },
        params: { id: '7' },
        body: {},
    });
    const temporaryPassword = response.body.data.matKhauTam;
    const login = await authService.login('nv.an', temporaryPassword);

    assert.equal(response.status, 200);
    assert.equal(state.account.LoginFailCount, 0);
    assert.equal(state.account.LockUntil, null);
    assert.equal(login.success, true);
    assert.equal(login.data.user.mustChangePassword, true);
});
