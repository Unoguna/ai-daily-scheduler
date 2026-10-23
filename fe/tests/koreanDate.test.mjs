import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync('src/lib/schedulerApi.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {}, process: { env: {} } };
vm.runInNewContext(source, context);
const today = context.exports.today;

test('Korean calendar date changes at 15:00 UTC', () => {
  assert.equal(today(new Date('2026-10-22T14:59:59Z')), '2026-10-22');
  assert.equal(today(new Date('2026-10-22T15:00:00Z')), '2026-10-23');
  assert.equal(today(new Date('2026-10-22T23:59:59Z')), '2026-10-23');
});
test('Korean date handles year and leap day boundaries', () => {
  assert.equal(today(new Date('2026-12-31T15:00:00Z')), '2027-01-01');
  assert.equal(today(new Date('2028-02-28T15:00:00Z')), '2028-02-29');
});

test('schedule query date rejects malformed and impossible calendar dates', () => {
  const valid = context.exports.isScheduleDate;
  for (const value of [null, '', 'tomorrow', '2026-02-29', '2026-02-30', '2026-13-01']) assert.equal(valid(value), false);
  assert.equal(valid('2028-02-29'), true);
  assert.equal(valid('2026-10-23'), true);
});
