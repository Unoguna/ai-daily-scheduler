"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/FormControls";
import { request, today } from "@/lib/schedulerApi";
import { calendarWeek, shiftCalendarDate } from "@/lib/calendarWeek";
import type { WeeklyCompletion } from "@/types/scheduler";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
const navigationClass = "rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-blue-50";

export function WeeklyCompletionPanel({ date, revision, onDateChange }: {
  date: string;
  revision: number;
  onDateChange: (date: string) => void;
}) {
  const range = calendarWeek(date);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${date}-${revision}-${attempt}`;
  const [result, setResult] = useState<{ key: string; data: WeeklyCompletion | null; error: string } | null>(null);
  const current = result?.key === requestKey ? result : null;
  const loading = current === null;
  const error = current?.error ?? "";

  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    request<WeeklyCompletion>(`/api/v1/schedules/statistics/weekly?date=${date}`, { signal: abort.signal })
      .then((data) => { if (active) setResult({ key: requestKey, data, error: "" }); })
      .catch((error) => {
        if (active) setResult({ key: requestKey, data: null, error: error instanceof Error ? error.message : "주간 기록을 불러오지 못했습니다." });
      });
    return () => { active = false; abort.abort(); };
  }, [date, requestKey]);

  const visible = current?.data?.weekStart === range.start ? current.data : null;
  return (
    <Panel title="주간 일정 완료율">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">{range.start} ~ {range.end} (월~일)</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={navigationClass} onClick={() => onDateChange(shiftCalendarDate(date, -7))}>이전 주</button>
          <button type="button" className={navigationClass} onClick={() => onDateChange(today())}>이번 주</button>
          <button type="button" className={navigationClass} onClick={() => onDateChange(shiftCalendarDate(date, 7))}>다음 주</button>
        </div>
      </div>
      <p className="mb-4 text-xs leading-5 text-slate-500">완료율은 완료 항목 ÷ 전체 확정 항목입니다. 휴식·고정 일정과 아직 지나지 않은 날짜의 일정도 포함합니다. 날짜를 누르면 해당 일정을 볼 수 있습니다.</p>
      <div aria-busy={loading}>
        {error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" className="mt-2 underline" onClick={() => setAttempt((value) => value + 1)}>다시 불러오기</button>
        </div> : loading || !visible ? <p role="status" className="text-sm text-slate-500">주간 기록을 불러오는 중...</p> : <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
            {[
              ["완료율", visible.completionRate === null ? "—" : `${visible.completionRate}%`],
              ["전체 일정", `${visible.totalCount}개`],
              ["완료", `${visible.completedCount}개`],
              ["미완료", `${visible.incompleteCount}개`],
            ].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
            </div>)}
          </div>
          {visible.totalCount === 0 ? <p role="status" className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">이 주에는 확정된 일정이 없습니다.</p> :
            <div role="progressbar" aria-label="주간 일정 완료율" aria-valuemin={0} aria-valuemax={100} aria-valuenow={visible.completionRate ?? 0} className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${visible.completionRate ?? 0}%` }} />
            </div>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {visible.days.map((day, index) => <button type="button" key={day.date}
              aria-pressed={day.date === date}
              aria-label={`${day.date} ${weekdays[index]}요일, 전체 ${day.totalCount}개, 완료 ${day.completedCount}개, 미완료 ${day.incompleteCount}개, ${day.completionRate === null ? "기록 없음" : `완료율 ${day.completionRate}%`}`}
              onClick={() => onDateChange(day.date)}
              className={`rounded-2xl border p-3 text-left transition hover:border-blue-300 ${day.date === date ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"}`}>
              <span className="block text-xs font-semibold text-slate-500">{day.date.slice(5)} ({weekdays[index]})</span>
              <span className="mt-2 block text-lg font-bold">{day.completionRate === null ? "—" : `${day.completionRate}%`}</span>
              <span className="mt-1 block text-xs text-slate-600">{day.totalCount === 0 ? "기록 없음" : `완료 ${day.completedCount} / ${day.totalCount}개`}</span>
            </button>)}
          </div>
        </>}
      </div>
    </Panel>
  );
}
