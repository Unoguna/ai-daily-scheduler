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
import { request, today } from "@/lib/schedulerApi";
import type {
  ConditionForm,
  EmotionState,
  GeneratedSchedule,
  ScheduleItem,
} from "@/types/scheduler";

function getInitialDate() {
  if (typeof window === "undefined") return today();

  const params = new URLSearchParams(window.location.search);
  return params.get("date") ?? today();
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
    setToast({ message: "처리 중...", type: "loading" });
    try {
      await action();
      setToast({ message: successMessage, type: "success" });
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "요청에 실패했습니다.",
        type: "error",
      });
    }
  };

  const generateSchedule = (event: FormEvent) => {
    event.preventDefault();

    void run(async () => {
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
    if (!generated) return;

    void run(async () => {
      await request<{ id: number }>("/api/v1/schedules/confirm", {
        method: "POST",
        body: JSON.stringify({
          date,
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
    setGenerated((schedule) => {
      if (!schedule) return schedule;
      const items = schedule.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );
      return { ...schedule, items };
    });
  };

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-6">
        <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#577060]">
              Haru Planner
            </p>
            <h1 className="text-3xl font-bold">일정 생성과 확정</h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold"
          >
            대시보드로
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Panel title="당일 컨디션">
            <form onSubmit={generateSchedule} className="flex flex-col gap-4">
              <Input
                label="날짜"
                type="date"
                value={date}
                onChange={setDate}
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
                label={generated ? "컨디션 저장하고 다시 생성" : "일정 생성"}
              />
            </form>
          </Panel>

          <Panel title="일정 초안">
            {generated ? (
              <div className="flex flex-col gap-4">
                <CircularTimetableEditor
                  items={generated.items}
                  onChange={updateGeneratedItem}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={confirmSchedule}
                    className="rounded-md bg-[#243528] px-4 py-2 text-sm font-semibold text-white"
                  >
                    생성된 일정 확정
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#66705f]">
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
    loading: "border-[#c8cbbf] bg-white text-[#243528]",
    success: "border-[#9fb49c] bg-[#f5fbf3] text-[#243528]",
    error: "border-[#d6a2a2] bg-[#fff7f7] text-[#612b2b]",
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)] rounded-md border px-4 py-3 text-sm font-semibold shadow-lg md:max-w-sm ${colorClass}`}
    >
      {toast.message}
    </div>
  );
}
