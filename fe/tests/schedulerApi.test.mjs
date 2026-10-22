import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync('src/lib/schedulerApi.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(fetch) {
  const values = new Map([['accessToken', 'old'], ['refreshToken', 'refresh']]);
  const redirects = [];
  const context = { exports: {}, process: { env: {} }, Headers, FormData,
    localStorage: { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) },
    window: { location: { pathname: '/', replace: p => redirects.push(p) } }, fetch };
  vm.runInNewContext(source, context);
  return { request: context.exports.request, values, redirects };
}
const ok = data => Response.json({ success: true, data });
const tokens = () => ok({ accessToken: 'new', refreshToken: 'rotated' });
test('concurrent 401s share refresh and retry POST bodies and headers', async () => {
  let refreshes = 0, retries = 0;
  const app = setup(async (url, init) => {
    if (url.endsWith('/refresh')) {
      refreshes++;
      assert.equal(init.body, JSON.stringify({ refreshToken: 'refresh' }));
      assert.equal(new Headers(init.headers).has('Authorization'), false);
      await new Promise(r => setTimeout(r, 10));
      return tokens();
    }
    assert.equal(init.method, 'POST'); assert.equal(init.body, '{"a":1}');
    assert.equal(init.headers.get('X-Test'), 'yes');
    if (init.headers.get('Authorization') === 'Bearer old') return new Response('', {status:401});
    retries++; return ok('saved');
  });
  assert.deepEqual(await Promise.all([1,2,3].map(() => app.request('/test', {method:'POST',body:'{"a":1}',headers:new Headers({'X-Test':'yes'})}))), ['saved','saved','saved']);
  assert.equal(refreshes,1); assert.equal(retries,3); assert.equal(app.values.get('refreshToken'),'rotated');
});
test('invalid refresh clears tokens and redirects', async () => {
  const app = setup(async () => new Response('', {status:401}));
  await assert.rejects(app.request('/test'));
  assert.equal(app.values.size,0); assert.deepEqual(app.redirects,['/login']);
});
test('retry stops after one refresh', async () => {
  let count=0;
  const app=setup(async url => { count++; return url.endsWith('/refresh') ? tokens() : new Response('',{status:401}); });
  await assert.rejects(app.request('/test')); assert.equal(count,3);
});
test('403 and 500 do not refresh or clear session', async () => {
  for (const status of [403,500]) {
    let count=0; const app=setup(async () => { count++; return new Response('',{status}); });
    await assert.rejects(app.request('/test')); assert.equal(count,1); assert.equal(app.values.size,2);
  }
});
test('refresh server/network failure preserves session', async () => {
  for (const fail of [() => new Response('',{status:503}), () => {throw new Error('offline');}]) {
    const app=setup(async url => url.endsWith('/refresh') ? fail() : new Response('',{status:401}));
    await assert.rejects(app.request('/test')); assert.equal(app.values.get('accessToken'),'old'); assert.equal(app.redirects.length,0);
  }
});
test('late refresh does not restore logged out session', async () => {
  const app=setup(async url => {
    if (!url.endsWith('/refresh')) return new Response('',{status:401});
    app.values.clear(); return tokens();
  });
  await assert.rejects(app.request('/test')); assert.equal(app.values.size,0);
});
test('multipart retry preserves body and browser boundary', async () => {
  const form=new FormData(); form.set('image',new Blob(['image']),'a.png');
  const app=setup(async (url, init) => {
    if(url.endsWith('/refresh')) return tokens();
    assert.equal(init.body,form); assert.equal(init.headers.has('Content-Type'),false);
    return init.headers.get('Authorization')==='Bearer old' ? new Response('',{status:401}) : ok('uploaded');
  });
  assert.equal(await app.request('/image',{method:'PATCH',body:form}),'uploaded');
});
test('late old-token 401 reuses refreshed token without another rotation', async () => {
  let refreshes = 0;
  let release;
  const delayed = new Promise(resolve => { release = resolve; });
  const app = setup(async (url, init) => {
    if (url.endsWith('/refresh')) { refreshes++; return tokens(); }
    if (init.headers.get('Authorization') === 'Bearer old') {
      if (url.endsWith('/slow')) await delayed;
      return new Response('', {status:401});
    }
    return ok('ok');
  });
  const slow = app.request('/slow');
  await app.request('/fast');
  release();
  assert.equal(await slow, 'ok');
  assert.equal(refreshes, 1);
});
test('missing refresh token redirects without calling refresh endpoint', async () => {
  let calls = 0;
  const app = setup(async () => { calls++; return new Response('', {status:401}); });
  app.values.delete('refreshToken');
  await assert.rejects(app.request('/test'));
  assert.equal(calls, 1); assert.equal(app.values.size, 0);
  assert.deepEqual(app.redirects, ['/login']);
});
test('successful requests do not refresh', async () => {
  let calls = 0;
  const app = setup(async () => { calls++; return ok('ok'); });
  assert.equal(await app.request('/test'), 'ok');
  assert.equal(calls, 1); assert.equal(app.values.get('accessToken'), 'old');
});
