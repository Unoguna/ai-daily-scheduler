"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Input,
  NumberField,
  Panel,
  Select,
  SubmitButton,
  TextArea,
} from "@/components/dashboard/FormControls";
import { CircularTimetableEditor } from "@/components/dashboard/Timeline";
import { request, today, isScheduleDate } from "@/lib/schedulerApi";
import type {
  ConditionForm,
  EmotionState,
  GeneratedSchedule,
  SchedulingProfile,
  ScheduleItem,
} from "@/types/scheduler";

function getInitialDate() {
  if (typeof window === "undefined") return today();

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("date");
  return isScheduleDate(requested) ? requested : today();
}

export default function ScheduleGeneratePage() {
  const router = useRouter();
  const [date, setDate] = useState(getInitialDate);
  const [form, setForm] = useState<ConditionForm>({
    fatigueLevel: 3,
    focusLevel: 3,
    emotionState: "NEUTRAL",
    memo: "",
  });
  const [generated, setGenerated] = useState<GeneratedSchedule | null>(null);
  const [busy, setBusy] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (!savedToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!toast || toast.type === "loading") return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const run = async (action: () => Promise<void>, successMessage: string) => {
    if (busy) return;
    setBusy(true);
    setGenerationError("");
    setToast({ message: "처리 중...", type: "loading" });
    try {
      await action();
      setToast({ message: successMessage, type: "success" });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "요청에 실패했습니다.");
      setToast({
        message:
          error instanceof Error ? error.message : "요청에 실패했습니다.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const generateSchedule = (event: FormEvent) => {
    event.preventDefault();

    void run(async () => {
      setGenerated(null);
      const profile = await request<SchedulingProfile | null>(
        "/api/v1/schedules/scheduling-profile",
      );
      if (!profile) {
        throw new Error("스케줄링 프로필 설정 페이지에서 생활 패턴을 먼저 저장해 주세요.");
      }
      await request<{ id: number }>("/api/v1/daily-conditions", {
        method: "POST",
        body: JSON.stringify({
          date,
          fatigueLevel: Number(form.fatigueLevel),
          focusLevel: Number(form.focusLevel),
          emotionState: form.emotionState,
          memo: form.memo || null,
        }),
      });

      const schedule = await request<GeneratedSchedule>(
        `/api/v1/schedules/generate?date=${date}`,
        { method: "POST" },
      );
      setGenerated(schedule);
    }, "컨디션을 저장하고 일정 초안을 생성했습니다.");
  };

  const confirmSchedule = () => {
    if (!generated || generated.date !== date || generated.items.length === 0 || busy) return;

    void run(async () => {
      await request<{ id: number }>("/api/v1/schedules/confirm", {
        method: "POST",
        body: JSON.stringify({
          date: generated.date,
          items: generated.items,
        }),
      });
      router.push("/");
    }, "하루 일정을 확정했습니다.");
  };

  const updateGeneratedItem = (
    index: number,
    key: keyof ScheduleItem,
    value: string,
  ) => {
    let nextSelectedIndex: number | void = index;

    setGenerated((schedule) => {
      if (!schedule) return schedule;
      const updatedTargetItem = { ...schedule.items[index], [key]: value };
      const updatedItems = schedule.items.map((item, itemIndex) =>
        itemIndex === index ? updatedTargetItem : item,
      );
      const result =
        key === "startTime" || key === "endTime"
          ? trimOverlappingGeneratedItems(updatedItems, updatedTargetItem)
          : { items: updatedItems, targetIndex: index };
      nextSelectedIndex = result.targetIndex;

      return { ...schedule, items: result.items };
    });

    return nextSelectedIndex;
  };

  const deleteGeneratedItem = (index: number) => {
    setGenerated((schedule) => {
      if (!schedule) return schedule;
      const items = schedule.items.filter((_, itemIndex) => itemIndex !== index);
      return { ...schedule, items };
    });
  };

  const trimOverlappingGeneratedItems = (
    items: ScheduleItem[],
    targetItem: ScheduleItem,
  ) => {
    if (!targetItem || !isValidTimeRange(targetItem)) {
      return { items, targetIndex: items.indexOf(targetItem) };
    }

    const targetStart = timeToMinutes(targetItem.startTime);
    const targetEnd = timeToMinutes(targetItem.endTime);
    const trimmedItems = items.flatMap((item) => {
      if (item === targetItem || !isValidTimeRange(item)) {
        return [item];
      }

      const itemStart = timeToMinutes(item.startTime);
      const itemEnd = timeToMinutes(item.endTime);
      const overlaps = itemStart < targetEnd && itemEnd > targetStart;

      if (!overlaps) {
        return [item];
      }

      const hasBefore = itemStart < targetStart;
      const hasAfter = itemEnd > targetEnd;

      if (hasBefore && hasAfter) {
        return [
          { ...item, endTime: minutesToTime(targetStart) },
          { ...item, startTime: minutesToTime(targetEnd) },
        ];
      }

      if (hasBefore) {
        return [{ ...item, endTime: minutesToTime(targetStart) }];
      }

      if (hasAfter) {
        return [{ ...item, startTime: minutesToTime(targetEnd) }];
      }

      return [];
    });

    return {
      items: trimmedItems,
      targetIndex: trimmedItems.indexOf(targetItem),
    };
  };

  const isValidTimeRange = (item: ScheduleItem) =>
    timeToMinutes(item.startTime) < timeToMinutes(item.endTime);

  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const minutesToTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Haru Planner
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">일정 생성과 확정</h1>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            대시보드로
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Panel title="당일 컨디션">
            <p className="mb-4 text-sm text-slate-600">
              처음 사용한다면 기상·취침 시간과 집중·휴식 시간을 먼저 저장해 주세요.{" "}
              <Link href="/scheduling-profile" className="font-semibold text-blue-600 underline">
                스케줄링 프로필 설정
              </Link>
            </p>
            <form onSubmit={generateSchedule} className="flex flex-col gap-4">
              <fieldset disabled={busy} className="flex flex-col gap-4 disabled:opacity-60">
              <Input
                label="날짜"
                type="date"
                value={date}
                onChange={(value) => { setDate(value); setGenerated(null); setGenerationError(""); }}
                required
              />

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                <NumberField
                  label="피로도"
                  value={form.fatigueLevel}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      fatigueLevel: value,
                    }))
                  }
                />
                <NumberField
                  label="집중도"
                  value={form.focusLevel}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      focusLevel: value,
                    }))
                  }
                />
              </div>

              <Select
                label="감정"
                value={form.emotionState}
                options={["VERY_BAD", "BAD", "NEUTRAL", "GOOD", "VERY_GOOD"]}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    emotionState: value as EmotionState,
                  }))
                }
              />

              <TextArea
                label="메모"
                value={form.memo}
                onChange={(value) =>
                  setForm((current) => ({ ...current, memo: value }))
                }
              />

              <SubmitButton
                label={generated ? "컨디션 저장 후 다시 생성" : "일정 생성"}
              />
              </fieldset>
            </form>
          </Panel>

          <Panel title="일정 초안">
            {generationError && <div role="alert" className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <p>{generationError}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link href="/fixed-schedules/new" className="underline">고정 일정 관리</Link>
                <Link href="/scheduling-profile" className="underline">활동·집중 시간 설정</Link>
              </div>
            </div>}
            {generated ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold">{generated.date} · 집중 {generated.sessionMinutes}분 / 휴식 {generated.breakMinutes}분</p>
                {generated.notices.length > 0 && <div role="status" className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                  <ul className="list-inside list-disc space-y-2">{generated.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul>
                </div>}
                {generated.unscheduledGoals.length > 0 && <section className="rounded-2xl border border-amber-200 p-4">
                  <h2 className="mb-2 text-sm font-bold">배치하지 못한 목표</h2>
                  <ul className="space-y-2">{generated.unscheduledGoals.map((goal) => <li key={goal.goalId} className="text-sm"><strong>{goal.title}</strong><p className="mt-1 text-slate-600">{goal.reason}</p></li>)}</ul>
                </section>}
                <div className="flex flex-wrap gap-3 text-sm text-blue-700">
                  <Link href="/goals/new" className="underline">목표 관리</Link>
                  <Link href="/scheduling-profile" className="underline">활동·집중 시간 설정</Link>
                </div>
                {generated.items.length === 0 && <p className="text-sm text-slate-600">생성된 일정이 없습니다. 목표와 활동 시간을 조정한 뒤 다시 생성해 주세요.</p>}
                {generated.items.length > 0 && <CircularTimetableEditor
                  items={generated.items}
                  onChange={updateGeneratedItem}
                  onDelete={deleteGeneratedItem}
                />}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={confirmSchedule}
                    disabled={busy || generated.date !== date || generated.items.length === 0}
                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    생성된 일정 확정
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                왼쪽에서 컨디션을 저장하면 수정 가능한 일정 초안이 표시됩니다.
              </p>
            )}
          </Panel>
        </div>

        <StatusToast toast={toast} />
      </div>
    </main>
  );
}

function StatusToast({
  toast,
}: {
  toast: {
    message: string;
    type: "loading" | "success" | "error";
  } | null;
}) {
  if (!toast) return null;

  const colorClass = {
    loading: "border-slate-200 bg-white text-slate-950",
    success: "border-emerald-200 bg-emerald-50 text-slate-950",
    error: "border-red-200 bg-red-50 text-red-700",
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)] rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg md:max-w-sm ${colorClass}`}
    >
      {toast.message}
    </div>
  );
}
