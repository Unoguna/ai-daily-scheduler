"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Input,
  Panel,
  Select,
  SubmitButton,
  TextArea,
} from "@/components/dashboard/FormControls";
import { request, today } from "@/lib/schedulerApi";
import type {
  AuthUser,
  Goal,
  GoalForm,
  GoalPriority,
  GoalStatus,
} from "@/types/scheduler";

const initialForm: GoalForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  targetDate: today(),
};

const statusOrder: GoalStatus[] = ["ACTIVE", "COMPLETED", "INACTIVE"];

export default function GoalManagePage() {
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);
  const [form, setForm] = useState<GoalForm>(initialForm);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const groupedGoals = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        goals: goals.filter((goal) => goal.status === status),
      })),
    [goals],
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
        const goalList = await request<Goal[]>("/api/v1/goals");
        setGoals(goalList);
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

  async function loadGoals() {
    const goalList = await request<Goal[]>("/api/v1/goals");
    setGoals(goalList);
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingGoalId(null);
  };

  const selectGoal = (goal: Goal) => {
    setEditingGoalId(goal.goalId);
    setForm({
      title: goal.title,
      description: goal.description ?? "",
      priority: goal.priority,
      targetDate: goal.targetDate ?? "",
    });
  };

  const submitGoal = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      const body = {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        targetDate: form.targetDate || null,
      };

      if (editingGoalId) {
        const updated = await request<Goal>(`/api/v1/goals/${editingGoalId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setGoals((currentGoals) =>
          currentGoals.map((goal) =>
            goal.goalId === updated.goalId ? updated : goal,
          ),
        );
        return;
      }

      await request<{ id: number }>("/api/v1/goals", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await loadGoals();
      resetForm();
    }, editingGoalId ? "목표를 수정했습니다." : "목표를 추가했습니다.");
  };

  const deleteGoal = (goalId: number) => {
    void run(async () => {
      await request<void>(`/api/v1/goals/${goalId}`, { method: "DELETE" });
      setGoals((currentGoals) =>
        currentGoals.filter((goal) => goal.goalId !== goalId),
      );
      if (editingGoalId === goalId) {
        resetForm();
      }
    }, "목표를 삭제했습니다.");
  };

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6">
        <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#577060]">
              Haru Planner
            </p>
            <h1 className="text-3xl font-bold">목표 관리</h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-[#aeb4a5] px-4 py-2 text-center text-sm font-semibold"
          >
            대시보드로
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Panel title={editingGoalId ? "목표 수정" : "목표 추가"}>
            <form onSubmit={submitGoal} className="flex flex-col gap-4">
              <Input
                label="제목"
                value={form.title}
                onChange={(value) =>
                  setForm((current) => ({ ...current, title: value }))
                }
                required
              />

              <TextArea
                label="설명"
                value={form.description}
                onChange={(value) =>
                  setForm((current) => ({ ...current, description: value }))
                }
              />

              <Select
                label="우선순위"
                value={form.priority}
                options={["LOW", "MEDIUM", "HIGH"]}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as GoalPriority,
                  }))
                }
              />

              <Input
                label="마감일"
                type="date"
                value={form.targetDate}
                onChange={(value) =>
                  setForm((current) => ({ ...current, targetDate: value }))
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                {editingGoalId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
                  >
                    새 목표
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
                  >
                    취소
                  </Link>
                )}
                <SubmitButton label={editingGoalId ? "목표 수정" : "목표 추가"} />
              </div>
            </form>
          </Panel>

          <Panel title="전체 목표">
            <div className="grid gap-4 md:grid-cols-3">
              {groupedGoals.map(({ status, goals: statusGoals }) => (
                <section
                  key={status}
                  className="rounded-md border border-[#d7d9cf] bg-white p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-[#243528]">{status}</h3>
                    <span className="text-xs font-semibold text-[#66705f]">
                      {statusGoals.length}개
                    </span>
                  </div>

                  {statusGoals.length === 0 ? (
                    <p className="text-sm text-[#66705f]">목표 없음</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {statusGoals.map((goal) => (
                        <div
                          key={goal.goalId}
                          className="rounded-md border border-[#e1e3da] bg-[#fbfcf7] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {goal.title}
                              </p>
                              <p className="mt-1 text-sm text-[#66705f]">
                                {goal.description || "설명 없음"}
                              </p>
                              <p className="mt-2 text-xs font-semibold text-[#577060]">
                                {goal.priority}
                                {goal.targetDate ? ` · ${goal.targetDate}` : ""}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => selectGoal(goal)}
                                className="rounded-md border border-[#aeb4a5] px-3 py-1 text-xs font-semibold"
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteGoal(goal.goalId)}
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
