import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync('src/lib/loginDestination.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function destination(request) {
  const context = { exports: {}, require: () => ({ request }) };
  vm.runInNewContext(source, context);
  return context.exports.getLoginDestination;
}

test('new account without a saved profile goes to setup', async () => {
  const route = destination(async path => {
    assert.equal(path, '/api/v1/schedules/scheduling-profile');
    return null;
  });
  assert.equal(await route(), '/scheduling-profile');
});
test('existing account with a saved profile goes to dashboard', async () => {
  assert.equal(await destination(async () => ({ preferredSessionMinutes: 50 }))(), '/');
});
test('a failed lookup is not treated as a missing profile', async () => {
  const error = new Error('Server unavailable');
  await assert.rejects(destination(async () => { throw error; })(), error);
});
