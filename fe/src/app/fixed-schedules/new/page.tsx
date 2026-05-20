"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Input,
  Panel,
  Select,
  SubmitButton,
} from "@/components/dashboard/FormControls";
import { request } from "@/lib/schedulerApi";
import type {
  AuthUser,
  DayOfWeek,
  FixedScheduleForm,
  ScheduleCategory,
} from "@/types/scheduler";

export default function NewFixedSchedulePage() {
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);
  const [form, setForm] = useState<FixedScheduleForm>({
    dayOfWeek: "MONDAY",
    title: "",
    category: "STUDY",
    startTime: "09:00:00",
    endTime: "10:00:00",
    mandatory: true,
  });

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        await request<AuthUser>("/api/v1/users/me");
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
      }
    };

    void verifyLogin();
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
        message: error instanceof Error ? error.message : "요청에 실패했습니다.",
        type: "error",
      });
    }
  };

  const createFixedSchedule = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await request<{ id: number }>("/api/v1/schedules/fixed-schedules", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm((current) => ({ ...current, title: "" }));
    }, "고정 일정을 추가했습니다.");
  };

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6">
        <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#577060]">
              Haru Planner
            </p>
            <h1 className="text-3xl font-bold">고정 일정 추가</h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold"
          >
            대시보드로
          </Link>
        </header>

        <Panel title="고정 일정 정보">
          <form onSubmit={createFixedSchedule} className="flex flex-col gap-4">
            <Select
              label="요일"
              value={form.dayOfWeek}
              options={[
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY",
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  dayOfWeek: value as DayOfWeek,
                }))
              }
            />

            <Input
              label="제목"
              value={form.title}
              onChange={(value) =>
                setForm((current) => ({ ...current, title: value }))
              }
              required
            />

            <Select
              label="카테고리"
              value={form.category}
              options={[
                "CLASS",
                "STUDY",
                "EXERCISE",
                "WORK",
                "MEETING",
                "PERSONAL",
                "OTHER",
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  category: value as ScheduleCategory,
                }))
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="시작"
                type="time"
                value={form.startTime.slice(0, 5)}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    startTime: `${value}:00`,
                  }))
                }
              />
              <Input
                label="종료"
                type="time"
                value={form.endTime.slice(0, 5)}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    endTime: `${value}:00`,
                  }))
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.mandatory}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mandatory: event.target.checked,
                  }))
                }
                className="size-4"
              />
              필수 일정
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href="/"
                className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
              >
                취소
              </Link>
              <SubmitButton label="고정 일정 추가" />
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
