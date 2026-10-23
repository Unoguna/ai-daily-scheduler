"use client";

import { FormEvent, useState } from "react";
import { Panel } from "@/components/dashboard/FormControls";
import { request } from "@/lib/schedulerApi";
import type { ConfirmedSchedule, ScheduleChangePreview } from "@/types/scheduler";

export function ScheduleChatPanel({ confirmed, onApplied, disabled }: {
  confirmed: ConfirmedSchedule;
  onApplied: (schedule: ConfirmedSchedule) => void;
  disabled: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<"preview" | "apply" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<{ preview: ScheduleChangePreview; snapshot: string } | null>(null);
  const snapshot = JSON.stringify(confirmed);
  const stale = result !== null && result.snapshot !== snapshot;
  const busy = pending !== null || disabled;

  const preview = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !message.trim()) return;
    setPending("preview");
    setError("");
    setNotice("");
    setResult(null);
    try {
      const proposal = await request<ScheduleChangePreview>(
        `/api/v1/schedules/${confirmed.confirmedScheduleId}/changes/preview`,
        { method: "POST", body: JSON.stringify({ message: message.trim() }) },
      );
      setResult({ preview: proposal, snapshot });
    } catch (error) {
      setError(error instanceof Error ? error.message : "변경안 생성에 실패했습니다.");
    } finally {
      setPending(null);
    }
  };

  const apply = async () => {
    if (busy || !result || stale) return;
    setPending("apply");
    setError("");
    try {
      const schedule = await request<ConfirmedSchedule>(
        `/api/v1/schedules/${confirmed.confirmedScheduleId}/changes/${result.preview.proposalId}/apply`,
        { method: "POST" },
      );
      onApplied(schedule);
      setResult(null);
      setMessage("");
      setNotice("변경안을 일정에 적용했습니다.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "변경안 적용에 실패했습니다.");
      setResult(null);
    } finally {
      setPending(null);
    }
  };

  return (
    <Panel title="대화로 일정 수정">
      <p className="mb-3 text-sm leading-6 text-slate-600">
        예: “오후 공부를 30분 줄이고 남는 시간에 휴식을 넣어줘.” 변경안을 확인한 뒤 적용할 수 있습니다.
        고정 일정과 완료한 일정은 보호됩니다.
      </p>
      <form onSubmit={preview} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2 text-sm font-semibold">
          어떻게 바꾸고 싶으신가요?
          <textarea
            required maxLength={1000} disabled={busy} value={message}
            onChange={(event) => { setMessage(event.target.value); setResult(null); setError(""); setNotice(""); }}
            placeholder="어떤 일정을 언제로 옮길지, 얼마나 줄일지 알려주세요."
            className="min-h-24 rounded-2xl border border-slate-200 px-3 py-3 font-normal focus:border-blue-400 focus:outline-none disabled:opacity-50"
          />
        </label>
        <p className="text-xs text-slate-500">선택한 날짜의 일정 제목·시간·유형·완료 여부와 요청을 Google Gemini에 전달합니다.</p>
        <div className="flex justify-end">
          <button type="submit" disabled={busy || !message.trim()} className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {pending === "preview" ? "변경안 생성 중..." : "변경안 만들기"}
          </button>
        </div>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {stale && <p role="status" className="mt-4 text-sm text-amber-700">일정이 바뀌었습니다. 변경안을 다시 만들어 주세요.</p>}
      {result && !stale && (
        <section className="mt-5 border-t border-slate-200 pt-5" aria-label="일정 변경 미리보기">
          <p className="mb-4 text-sm font-semibold text-slate-800">{result.preview.summary}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <ScheduleComparison title="변경 전" items={result.preview.before.items} compare={result.preview.after.items} />
            <ScheduleComparison title="변경 후" items={result.preview.after.items} compare={result.preview.before.items} />
          </div>
          <p className="mt-3 text-xs text-slate-500">강조된 항목이 변경 대상입니다. 변경안은 10분 동안 유효합니다.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setResult(null)} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">취소</button>
            <button type="button" disabled={busy} onClick={() => void apply()} className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{pending === "apply" ? "적용 중..." : "변경안 적용"}</button>
          </div>
        </section>
      )}
    </Panel>
  );
}

function ScheduleComparison({ title, items, compare }: {
  title: string;
  items: ScheduleChangePreview["after"]["items"];
  compare: ScheduleChangePreview["after"]["items"];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => {
          const other = item.scheduleItemId === null ? undefined : compare.find((candidate) => candidate.scheduleItemId === item.scheduleItemId);
          const changed = !other || item.startTime !== other.startTime || item.endTime !== other.endTime;
          return <li key={item.scheduleItemId ?? `new-${index}`} className={`rounded-xl p-3 text-sm ${changed ? "bg-blue-50 text-blue-900" : "bg-slate-50 text-slate-600"}`}>
            <p className="font-semibold">{item.title}{changed && <span className="ml-2 text-xs">변경</span>}</p>
            <p className="mt-1 text-xs">{item.startTime.slice(0, 5)} – {item.endTime.slice(0, 5)}{item.completed ? " · 완료" : ""}{item.type === "FIXED_SCHEDULE" ? " · 고정" : ""}</p>
          </li>;
        })}
      </ul>
    </div>
  );
}
