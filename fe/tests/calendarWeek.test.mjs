import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync('src/lib/calendarWeek.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(source, context);
const { calendarWeek, shiftCalendarDate } = context.exports;

test('Monday and Sunday select the same Monday-through-Sunday range', () => {
  for (const day of ['2026-10-19', '2026-10-23', '2026-10-25']) {
    const range = calendarWeek(day);
    assert.equal(range.start, '2026-10-19');
    assert.equal(range.end, '2026-10-25');
  }
});
test('week navigation handles month, year and leap day boundaries', () => {
  assert.equal(shiftCalendarDate('2027-01-01', -7), '2026-12-25');
  assert.equal(shiftCalendarDate('2028-02-29', 7), '2028-03-07');
  assert.equal(calendarWeek('2027-01-01').start, '2026-12-28');
  assert.equal(calendarWeek('2027-01-01').end, '2027-01-03');
  assert.equal(calendarWeek('2028-02-29').end, '2028-03-05');
});
