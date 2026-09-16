const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const serviceSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/auth/auth.service.js'),
    'utf8'
);
const controllerSource = fs.readFileSync(
    path.join(__dirname, '../src/modules/auth/auth.controller.js'),
    'utf8'
);

test('refresh token rotation locks the account and increments its version', () => {
    assert.match(serviceSource, /WITH \(UPDLOCK, HOLDLOCK\)/);
    assert.match(serviceSource, /TokenVersion = @nextVersion/);
    assert.match(serviceSource, /user\.TokenVersion = nextVersion/);
});

test('logout revokes outstanding refresh tokens', () => {
    assert.match(controllerSource, /revokeRefreshTokens\(req\.user\.username\)/);
    assert.match(serviceSource, /TokenVersion = ISNULL\(TokenVersion, 1\) \+ 1/);
});
