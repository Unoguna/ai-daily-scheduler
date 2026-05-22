"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardHeader,
  DateToolbar,
  StatusMessage,
} from "@/components/dashboard/DashboardHeader";
import {
  ConfirmedSchedulePanel,
  FeedbackPanel,
  ScheduleGenerationPanel,
  SummaryPanels,
} from "@/components/dashboard/SchedulePanels";
import { request, today } from "@/lib/schedulerApi";
import type {
  AuthUser,
  ConfirmedSchedule,
  FixedSchedule,
  GeneratedSchedule,
  Goal,
  ScheduleItem,
} from "@/types/scheduler";

const GENERATED_SCHEDULE_STORAGE_KEY = "pendingGeneratedSchedule";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [generated, setGenerated] = useState<GeneratedSchedule | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedSchedule | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    satisfactionScore: 3,
    rawFeedback: "",
  });

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === "ACTIVE"),
    [goals],
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken") ?? "";
    if (!savedToken) {
      router.replace("/login");
      return;
    }

    const pendingGeneratedSchedule = sessionStorage.getItem(
      GENERATED_SCHEDULE_STORAGE_KEY,
    );
    if (pendingGeneratedSchedule) {
      try {
        const schedule = JSON.parse(
          pendingGeneratedSchedule,
        ) as GeneratedSchedule;
        setSelectedDate(schedule.date);
        setGenerated(schedule);
      } finally {
        sessionStorage.removeItem(GENERATED_SCHEDULE_STORAGE_KEY);
      }
    }

    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedDate]);

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

  const clearAuthState = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken("");
    setUser(null);
    setGoals([]);
    setFixedSchedules([]);
    setGenerated(null);
    setConfirmed(null);
  };

  const loadDashboard = async () => {
    await run(async () => {
      let me: AuthUser;
      try {
        me = await request<AuthUser>("/api/v1/users/me");
      } catch {
        clearAuthState();
        router.replace("/login");
        throw new Error("로그인이 필요합니다.");
      }

      const [goalList, fixedList] = await Promise.all([
        request<Goal[]>("/api/v1/goals"),
        request<FixedSchedule[]>("/api/v1/schedules/fixed-schedules"),
      ]);
      setUser(me);
      setGoals(goalList);
      setFixedSchedules(fixedList);

      try {
        const dailySchedule = await request<ConfirmedSchedule | null>(
          `/api/v1/schedules?date=${selectedDate}`,
        );
        setConfirmed(dailySchedule);
      } catch {
        setConfirmed(null);
      }
    }, "데이터를 불러왔습니다.");
  };

  const logout = () => {
    void run(async () => {
      try {
        await request<void>("/api/v1/auth/logout", { method: "POST" });
      } catch {
        // Local logout should still complete even if the server token expired.
      } finally {
        clearAuthState();
        router.push("/login");
      }
    }, "로그아웃했습니다.");
  };

  const generateSchedule = () => {
    router.push(`/conditions/new?date=${selectedDate}`);
  };

  const confirmSchedule = () => {
    if (!generated) return;

    void run(async () => {
      await request<{ id: number }>("/api/v1/schedules/confirm", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          items: generated.items,
        }),
      });
      const dailySchedule = await request<ConfirmedSchedule>(
        `/api/v1/schedules?date=${selectedDate}`,
      );
      setConfirmed(dailySchedule);
    }, "하루 일정을 확정했습니다.");
  };

  const submitFeedback = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await request("/api/v1/schedules/feedback", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          satisfactionScore: Number(feedbackForm.satisfactionScore),
          rawFeedback: feedbackForm.rawFeedback,
        }),
      });
      setFeedbackForm({ satisfactionScore: 3, rawFeedback: "" });
    }, "피드백을 저장하고 분석했습니다.");
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

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6">
        <DashboardHeader user={user} onLogout={logout} />
        <DateToolbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          isAuthenticated={Boolean(user)}
        />
        <StatusMessage toast={toast} />

        <div className="flex flex-col gap-6">
          <SummaryPanels
            activeGoals={activeGoals}
            fixedSchedules={fixedSchedules}
          />
          <ScheduleGenerationPanel
            generated={generated}
            onGenerateSchedule={generateSchedule}
            onConfirmSchedule={confirmSchedule}
            onUpdateGeneratedItem={updateGeneratedItem}
          />
          <ConfirmedSchedulePanel confirmed={confirmed} />
          <FeedbackPanel
            feedbackForm={feedbackForm}
            setFeedbackForm={setFeedbackForm}
            onSubmitFeedback={submitFeedback}
          />
        </div>
      </div>
    </main>
  );
}
