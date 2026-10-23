import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const stateSource = compile('src/lib/oauthState.ts');
const loginSource = compile('src/lib/socialLogin.ts');
const storageKey = 'oauth.pending-login';
function setup() {
  const values = new Map();
  let now = 1800000000000;
  const requests = [];
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const stateContext = {
    exports: {}, URL, Uint8Array,
    Date: { now: () => now },
    window: { crypto: webcrypto, sessionStorage: storage },
  };
  vm.runInNewContext(stateSource, stateContext);
  const state = stateContext.exports;
  let reply = () => Response.json({ success: true, data: { accessToken: 'access', refreshToken: 'refresh' } });
  const loginContext = {
    exports: {}, require: () => state, process: { env: { NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8080' } },
    fetch: async (url, init) => { requests.push({ url, init }); return reply(); },
  };
  vm.runInNewContext(loginSource, loginContext);
  return { ...state, complete: loginContext.exports.completeSocialLogin, values, requests, storage,
    setNow: value => { now = value; }, advance: amount => { now += amount; },
    setReply: value => { reply = value; } };
}
const callback = (state, extra = { code: 'authorization-code' }) => new URLSearchParams({ state, ...extra });

for (const provider of ['google', 'kakao']) {
  test(`${provider}: authorization URL includes unpredictable state and configured callback`, () => {
    const app = setup();
    const uri = `http://localhost:3000/login/${provider}/callback`;
    const url = new URL(app.socialAuthorizationUrl(provider, 'client-id', uri));
    assert.equal(url.hostname, provider === 'google' ? 'accounts.google.com' : 'kauth.kakao.com');
    assert.equal(url.searchParams.get('redirect_uri'), uri);
    assert.equal(url.searchParams.get('client_id'), 'client-id');
    assert.match(url.searchParams.get('state'), /^[a-f0-9]{64}$/);
    const pending = JSON.parse(app.values.get(storageKey));
    assert.equal(pending.state, url.searchParams.get('state'));
    assert.equal(pending.provider, provider);
    if (provider === 'google') assert.equal(url.searchParams.get('scope'), 'openid email profile');
  });
  test(`${provider}: valid state is consumed before exchanging code`, async () => {
    const app = setup();
    const state = app.createOAuthState(provider);
    const tokens = await app.complete(provider, callback(state));
    assert.equal(tokens.accessToken, 'access');
    assert.equal(tokens.refreshToken, 'refresh');
    assert.equal(app.values.size, 0);
    assert.equal(app.requests.length, 1);
    assert.equal(app.requests[0].url, `http://localhost:8080/api/v1/auth/${provider}`);
    assert.equal(app.requests[0].init.body, JSON.stringify({ code: 'authorization-code' }));
    await assert.rejects(app.complete(provider, callback(state)), /로그인 요청/);
    assert.equal(app.requests.length, 1);
  });
}

test('new attempts replace previous attempts and generate unique random values', () => {
  const app = setup();
  const values = new Set(Array.from({ length: 50 }, () => app.createOAuthState('google')));
  assert.equal(values.size, 50);
  const old = app.createOAuthState('google');
  app.createOAuthState('kakao');
  assert.throws(() => app.consumeOAuthState('google', old), /로그인 요청/);
});

test('missing and mismatched state never call backend and clear pending login', async () => {
  for (const state of [null, '', 'a'.repeat(64)]) {
    const app = setup();
    app.createOAuthState('google');
    const params = new URLSearchParams({ code: 'code' });
    if (state !== null) params.set('state', state);
    await assert.rejects(app.complete('google', params), /로그인 요청/);
    assert.equal(app.requests.length, 0);
    assert.equal(app.values.size, 0);
  }
});

test('state from a different provider or tab is rejected', async () => {
  const first = setup();
  const second = setup();
  const state = first.createOAuthState('google');
  await assert.rejects(second.complete('google', callback(state)), /로그인 요청/);
  await assert.rejects(first.complete('kakao', callback(state)), /로그인 요청/);
  assert.equal(first.requests.length + second.requests.length, 0);
});

test('ten-minute expiration boundary is enforced', async () => {
  const valid = setup();
  const state = valid.createOAuthState('google');
  valid.advance(599999);
  await valid.complete('google', callback(state));
  const expired = setup();
  const old = expired.createOAuthState('google');
  expired.advance(600000);
  await assert.rejects(expired.complete('google', callback(old)), /만료/);
  assert.equal(expired.requests.length, 0);
});

test('malformed saved data and future timestamps fail closed', async () => {
  for (const raw of ['not-json', 'null', '{}', JSON.stringify({ provider: 'google', state: 'a'.repeat(64), createdAt: '1800000000000' })]) {
    const app = setup();
    app.values.set(storageKey, raw);
    await assert.rejects(app.complete('google', callback('a'.repeat(64))), /로그인 요청/);
    assert.equal(app.requests.length, 0);
  }
  const app = setup();
  const state = app.createOAuthState('google');
  app.advance(-1);
  await assert.rejects(app.complete('google', callback(state)), /로그인 요청/);
});

test('cancelled login consumes matching state without exchanging code', async () => {
  const app = setup();
  const state = app.createOAuthState('kakao');
  await assert.rejects(app.complete('kakao', callback(state, { error: 'access_denied' })), /취소/);
  assert.equal(app.requests.length, 0);
  assert.equal(app.values.size, 0);
});

test('missing code and duplicate state or code parameters are rejected', async () => {
  for (const kind of ['missing-code', 'duplicate-code', 'duplicate-state']) {
    const app = setup();
    const state = app.createOAuthState('google');
    const params = callback(state);
    if (kind === 'missing-code') params.delete('code');
    if (kind === 'duplicate-code') params.append('code', 'other-code');
    if (kind === 'duplicate-state') params.append('state', state);
    await assert.rejects(app.complete('google', params));
    assert.equal(app.requests.length, 0);
    assert.equal(app.values.size, 0);
  }
});

test('concurrent replay exchanges the authorization code only once', async () => {
  const app = setup();
  const state = app.createOAuthState('google');
  const results = await Promise.allSettled([app.complete('google', callback(state)), app.complete('google', callback(state))]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter(result => result.status === 'rejected').length, 1);
  assert.equal(app.requests.length, 1);
});

test('backend failure consumes state and requires a fresh login', async () => {
  const app = setup();
  const state = app.createOAuthState('google');
  app.setReply(() => new Response('', { status: 500 }));
  await assert.rejects(app.complete('google', callback(state)), /실패/);
  await assert.rejects(app.complete('google', callback(state)), /로그인 요청/);
  assert.equal(app.requests.length, 1);
});

test('incomplete token responses do not complete login', async () => {
  const app = setup();
  const state = app.createOAuthState('google');
  app.setReply(() => Response.json({ success: true, data: { accessToken: 'access' } }));
  await assert.rejects(app.complete('google', callback(state)), /응답/);
});

test('unavailable browser storage prevents starting or completing login', async () => {
  const app = setup();
  app.storage.setItem = () => { throw new Error('blocked'); };
  assert.throws(() => app.createOAuthState('google'), /저장/);
  app.storage.getItem = () => { throw new Error('blocked'); };
  await assert.rejects(app.complete('google', callback('a'.repeat(64))), /로그인 요청/);
  assert.equal(app.requests.length, 0);
});
