const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePassword, generateTempPassword } = require('../src/utils/password');

test('password policy is shared and rejects weak passwords', () => {
    assert.equal(validatePassword('abcdef'), 'Mật khẩu phải có ít nhất 8 ký tự');
    assert.equal(validatePassword('abcdefgh'), 'Mật khẩu phải có ít nhất 1 chữ hoa');
    assert.equal(validatePassword('Abcdefgh'), 'Mật khẩu phải có ít nhất 1 chữ số');
    assert.equal(validatePassword('Abcdefg1'), 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    assert.equal(validatePassword('Abcdefg1!'), null);
});

test('generated temporary passwords always satisfy the shared policy', () => {
    for (let i = 0; i < 100; i += 1) {
        const password = generateTempPassword();
        assert.equal(password.length, 12);
        assert.equal(validatePassword(password), null);
    }
});
