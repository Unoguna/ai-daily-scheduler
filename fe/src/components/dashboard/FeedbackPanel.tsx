"use client";

import { FormEvent, useEffect, useState } from "react";
import { NumberField, Panel } from "@/components/dashboard/FormControls";
import { request } from "@/lib/schedulerApi";
import type { FeedbackForm, ScheduleFeedback } from "@/types/scheduler";

export function FeedbackPanel({ date }: { date: string }) {
  const [form, setForm] = useState<FeedbackForm>({ satisfactionScore: 3, rawFeedback: "" });
  const [saved, setSaved] = useState<ScheduleFeedback | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    request<ScheduleFeedback | null>(`/api/v1/schedules/feedback?date=${date}`, { signal: abort.signal })
      .then((feedback) => {
        if (!active) return;
        setSaved(feedback);
        setForm(feedback ? { satisfactionScore: feedback.satisfactionScore, rawFeedback: feedback.rawFeedback }
          : { satisfactionScore: 3, rawFeedback: "" });
        setLoaded(true);
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : "피드백을 불러오지 못했습니다.");
      });
    return () => { active = false; abort.abort(); };
  }, [date, attempt]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!loaded || saving || !form.rawFeedback.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const feedback = await request<ScheduleFeedback>("/api/v1/schedules/feedback", {
        method: "POST",
        body: JSON.stringify({ date, satisfactionScore: form.satisfactionScore, rawFeedback: form.rawFeedback.trim() }),
      });
      setSaved(feedback);
      setForm({ satisfactionScore: feedback.satisfactionScore, rawFeedback: feedback.rawFeedback });
      setNotice("피드백과 분석 결과를 저장했습니다.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "피드백 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const signed = (value: number) => `${value > 0 ? "+" : ""}${value}분`;
  return (
    <Panel title={`${date} 하루 피드백`}>
      <p className="mb-4 text-sm leading-6 text-slate-600">
        저장한 피드백을 다시 확인하고 수정할 수 있습니다. 이후 날짜의 일정을 새로 생성할 때,
        생성일 전 7일의 피드백 평균을 반영합니다. 이미 확정한 일정은 자동 변경되지 않습니다.
      </p>
      {!loaded && !error && <p role="status" className="mb-3 text-sm text-slate-500">피드백을 불러오는 중...</p>}
      {loaded && !saved && <p className="mb-3 text-sm text-slate-500">이 날짜에는 저장한 피드백이 없습니다.</p>}
      {error && <div role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
        <p>{error}</p>
        {!loaded && <button type="button" className="mt-2 underline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>다시 불러오기</button>}
      </div>}
      {notice && <p role="status" className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      <form onSubmit={submit}>
        <fieldset disabled={!loaded || saving} className="flex flex-col gap-3 disabled:opacity-50">
          <NumberField label="만족도 (1~5점)" value={form.satisfactionScore}
            onChange={(value) => { setForm((current) => ({ ...current, satisfactionScore: value })); setNotice(""); }} />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            피드백
            <textarea required maxLength={1000} value={form.rawFeedback}
              onChange={(event) => { setForm((current) => ({ ...current, rawFeedback: event.target.value })); setNotice(""); }}
              className="min-h-24 rounded-2xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-400" />
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={!form.rawFeedback.trim()} className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "분석 및 저장 중..." : saved ? "피드백 수정 저장" : "피드백 저장"}
            </button>
          </div>
        </fieldset>
      </form>
      {saved && <section className="mt-5 rounded-2xl bg-slate-50 p-4" aria-label="저장된 피드백 분석 결과">
        <h3 className="mb-2 text-sm font-bold">마지막 저장한 피드백 분석</h3>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{saved.aiSummary || "분석 요약이 없습니다."}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">집중 시간 조정</dt><dd className="mt-1 font-semibold">{signed(saved.sessionMinutesAdjustment)}</dd></div>
          <div><dt className="text-slate-500">휴식 시간 조정</dt><dd className="mt-1 font-semibold">{signed(saved.breakMinutesAdjustment)}</dd></div>
          <div><dt className="text-slate-500">오후 부담 조정 강도</dt><dd className="mt-1 font-semibold">{saved.afternoonFocusPenalty} / 40</dd></div>
          <div><dt className="text-slate-500">고강도 목표를 줄일 시간</dt><dd className="mt-1 font-semibold">{saved.avoidHeavyTasksAfter ? `${saved.avoidHeavyTasksAfter.slice(0, 5)} 이후` : "별도 제한 없음"}</dd></div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-slate-500">이 값은 해당 피드백의 분석 결과입니다. 실제 일정에는 최근 7일의 평균과 당일 컨디션, 시간 제한을 함께 적용합니다.</p>
      </section>}
    </Panel>
  );
}
