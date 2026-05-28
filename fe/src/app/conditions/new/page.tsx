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
import { request, today } from "@/lib/schedulerApi";
import type {
  ConditionForm,
  EmotionState,
  GeneratedSchedule,
} from "@/types/scheduler";

const GENERATED_SCHEDULE_STORAGE_KEY = "pendingGeneratedSchedule";

function getInitialDate() {
  if (typeof window === "undefined") return today();

  const params = new URLSearchParams(window.location.search);
  return params.get("date") ?? today();
}

export default function DailyConditionPage() {
  const router = useRouter();
  const [date, setDate] = useState(getInitialDate);
  const [form, setForm] = useState<ConditionForm>({
    fatigueLevel: 3,
    focusLevel: 3,
    emotionState: "NEUTRAL",
    memo: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (!savedToken) {
      router.replace("/login");
      return;
    }

  }, [router]);

  useEffect(() => {
    if (!toast || toast.type === "loading") return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const submitConditionAndGenerate = (event: FormEvent) => {
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
      sessionStorage.setItem(
        GENERATED_SCHEDULE_STORAGE_KEY,
        JSON.stringify(schedule),
      );
      router.push("/");
    }, "컨디션을 저장하고 일정 초안을 생성했습니다.");
  };

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Haru Planner
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">당일 컨디션</h1>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            대시보드로
          </Link>
        </header>

        <Panel title="일정 생성을 위한 컨디션 저장">
          <form
            onSubmit={submitConditionAndGenerate}
            className="flex flex-col gap-4"
          >
            <Input
              label="날짜"
              type="date"
              value={date}
              onChange={setDate}
              required
            />

            <div className="grid gap-3 md:grid-cols-2">
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

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href="/"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                취소
              </Link>
              <SubmitButton label="저장하고 일정 생성" />
            </div>
          </form>
        </Panel>

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
