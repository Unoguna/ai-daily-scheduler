"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  FixedSchedule,
  FixedScheduleForm,
  ScheduleCategory,
} from "@/types/scheduler";

const initialForm: FixedScheduleForm = {
  dayOfWeek: "MONDAY",
  title: "",
  category: "STUDY",
  startTime: "09:00:00",
  endTime: "10:00:00",
  mandatory: true,
};

const dayOrder: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function FixedScheduleManagePage() {
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);
  const [form, setForm] = useState<FixedScheduleForm>(initialForm);
  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null,
  );

  const groupedSchedules = useMemo(
    () =>
      dayOrder.map((day) => ({
        day,
        schedules: fixedSchedules
          .filter((schedule) => schedule.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      })),
    [fixedSchedules],
  );

  useEffect(() => {
    const initializePage = async () => {
      const savedToken = localStorage.getItem("accessToken");
      if (!savedToken) {
        router.replace("/login");
        return;
      }

      try {
        await request<AuthUser>("/api/v1/users/me");
        const schedules = await request<FixedSchedule[]>(
          "/api/v1/schedules/fixed-schedules",
        );
        setFixedSchedules(schedules);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login");
      }
    };

    void initializePage();
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

  async function loadFixedSchedules() {
    const schedules = await request<FixedSchedule[]>(
      "/api/v1/schedules/fixed-schedules",
    );
    setFixedSchedules(schedules);
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingScheduleId(null);
  };

  const selectSchedule = (schedule: FixedSchedule) => {
    setEditingScheduleId(schedule.fixedScheduleId);
    setForm({
      dayOfWeek: schedule.dayOfWeek,
      title: schedule.title,
      category: schedule.category,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      mandatory: schedule.mandatory,
    });
  };

  const submitFixedSchedule = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (editingScheduleId) {
        const updated = await request<FixedSchedule>(
          `/api/v1/schedules/fixed-schedules/${editingScheduleId}`,
          {
            method: "PUT",
            body: JSON.stringify(form),
          },
        );
        setFixedSchedules((schedules) =>
          schedules.map((schedule) =>
            schedule.fixedScheduleId === updated.fixedScheduleId
              ? updated
              : schedule,
          ),
        );
        return;
      }

      await request<{ id: number }>("/api/v1/schedules/fixed-schedules", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await loadFixedSchedules();
      resetForm();
    }, editingScheduleId ? "고정 일정을 수정했습니다." : "고정 일정을 추가했습니다.");
  };

  const deleteFixedSchedule = (scheduleId: number) => {
    void run(async () => {
      await request<void>(`/api/v1/schedules/fixed-schedules/${scheduleId}`, {
        method: "DELETE",
      });
      setFixedSchedules((schedules) =>
        schedules.filter((schedule) => schedule.fixedScheduleId !== scheduleId),
      );
      if (editingScheduleId === scheduleId) {
        resetForm();
      }
    }, "고정 일정을 삭제했습니다.");
  };

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6">
        <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#577060]">
              Haru Planner
            </p>
            <h1 className="text-3xl font-bold">고정 일정 관리</h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold"
          >
            대시보드로
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Panel title={editingScheduleId ? "고정 일정 수정" : "고정 일정 추가"}>
            <form onSubmit={submitFixedSchedule} className="flex flex-col gap-4">
              <Select
                label="요일"
                value={form.dayOfWeek}
                options={dayOrder}
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
                {editingScheduleId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
                  >
                    새 일정
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
                  >
                    취소
                  </Link>
                )}
                <SubmitButton
                  label={editingScheduleId ? "고정 일정 수정" : "고정 일정 추가"}
                />
              </div>
            </form>
          </Panel>

          <Panel title="전체 고정 일정">
            <div className="grid gap-4 md:grid-cols-2">
              {groupedSchedules.map(({ day, schedules }) => (
                <section
                  key={day}
                  className="rounded-md border border-[#d7d9cf] bg-white p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-[#243528]">{day}</h3>
                    <span className="text-xs font-semibold text-[#66705f]">
                      {schedules.length}개
                    </span>
                  </div>

                  {schedules.length === 0 ? (
                    <p className="text-sm text-[#66705f]">일정 없음</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.fixedScheduleId}
                          className="rounded-md border border-[#e1e3da] bg-[#fbfcf7] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {schedule.title}
                              </p>
                              <p className="mt-1 text-sm text-[#66705f]">
                                {schedule.startTime.slice(0, 5)} -{" "}
                                {schedule.endTime.slice(0, 5)} ·{" "}
                                {schedule.category}
                              </p>
                              {schedule.mandatory ? (
                                <p className="mt-1 text-xs font-semibold text-[#577060]">
                                  필수 일정
                                </p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => selectSchedule(schedule)}
                                className="rounded-md border border-[#aeb4a5] px-3 py-1 text-xs font-semibold"
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteFixedSchedule(schedule.fixedScheduleId)
                                }
                                className="rounded-md border border-[#d6a2a2] px-3 py-1 text-xs font-semibold text-[#612b2b]"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
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
