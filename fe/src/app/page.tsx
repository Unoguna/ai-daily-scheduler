"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardHeader,
  DateToolbar,
  StatusMessage,
} from "@/components/dashboard/DashboardHeader";
import {
  ConfirmedSchedulePanel,
  SummaryPanels,
} from "@/components/dashboard/SchedulePanels";
import { request, today } from "@/lib/schedulerApi";
import { getLoginDestination } from "@/lib/loginDestination";
import { FeedbackPanel } from "@/components/dashboard/FeedbackPanel";
import { ScheduleChatPanel } from "@/components/dashboard/ScheduleChatPanel";
import { WeeklyCompletionPanel } from "@/components/dashboard/WeeklyCompletionPanel";
import type {
  AuthUser,
  ConfirmedSchedule,
  FixedSchedule,
  Goal,
  ScheduleItem,
} from "@/types/scheduler";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const selectedDateRef = useRef(selectedDate);
  const selectDate = (date: string) => {
    if (!date) return;
    selectedDateRef.current = date;
    setSelectedDate(date);
  };
  const [toast, setToast] = useState<{
    message: string;
    type: "loading" | "success" | "error";
  } | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [confirmed, setConfirmed] = useState<ConfirmedSchedule | null>(null);
  const [completionPending, setCompletionPending] = useState(false);
  const [statisticsRevision, setStatisticsRevision] = useState(0);

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
    setConfirmed(null);
  };

  const loadDashboard = async () => {
    await run(async () => {
      const me = await request<AuthUser>("/api/v1/users/me");
      const destination = await getLoginDestination();
      if (destination !== "/") {
        router.replace(destination);
        return;
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
        if (selectedDateRef.current === selectedDate) setConfirmed(dailySchedule);
      } catch {
        if (selectedDateRef.current === selectedDate) setConfirmed(null);
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

  const openScheduleGenerationPage = () => {
    router.push(`/schedules/generate?date=${selectedDate}`);
  };

  const updateConfirmedScheduleItem = async (
    index: number,
    item: ScheduleItem,
  ) => {
    if (!confirmed || confirmed.date !== selectedDate) return;

    const selectedItem = confirmed.items[index];
    if (!selectedItem) return;

    await run(async () => {
      const updated = await request<ConfirmedSchedule>(
        `/api/v1/schedules/${confirmed.confirmedScheduleId}/items/${selectedItem.scheduleItemId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            type: item.type,
            title: item.title,
            startTime: item.startTime,
            endTime: item.endTime,
            goalId: item.goalId,
            fixedScheduleId: item.fixedScheduleId,
            description: item.description,
          }),
        },
      );
      setConfirmed((current) => current?.confirmedScheduleId === updated.confirmedScheduleId
        && updated.date === selectedDateRef.current ? updated : current);
      setStatisticsRevision((value) => value + 1);
    }, "일정을 수정했습니다.");
  };

  const deleteConfirmedScheduleItem = async (index: number) => {
    if (!confirmed || confirmed.date !== selectedDate) return;
    const scheduleId = confirmed.confirmedScheduleId;

    const selectedItem = confirmed.items[index];
    if (!selectedItem) return;

    await run(async () => {
      const updated = await request<ConfirmedSchedule | null>(
        `/api/v1/schedules/${confirmed.confirmedScheduleId}/items/${selectedItem.scheduleItemId}`,
        { method: "DELETE" },
      );
      setConfirmed((current) => current?.confirmedScheduleId === scheduleId
        && current.date === selectedDateRef.current ? updated : current);
      setStatisticsRevision((value) => value + 1);
    }, "일정을 삭제했습니다.");
  };

  const changeCompletion = async (itemId: number, completed: boolean) => {
    if (!confirmed || confirmed.date !== selectedDate || completionPending) return;
    const scheduleId = confirmed.confirmedScheduleId;
    setCompletionPending(true);
    try {
      await run(async () => {
        const updated = await request<ConfirmedSchedule>(
          `/api/v1/schedules/${scheduleId}/items/${itemId}/completion`,
          { method: "PATCH", body: JSON.stringify({ completed }) },
        );
        setConfirmed((current) => current?.confirmedScheduleId === scheduleId
          && updated.date === selectedDateRef.current ? updated : current);
        setStatisticsRevision((value) => value + 1);
      }, completed ? "일정을 완료했습니다." : "일정 완료를 취소했습니다.");
    } finally {
      setCompletionPending(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader user={user} onLogout={logout} />
        <DateToolbar
          selectedDate={selectedDate}
          onDateChange={selectDate}
          isAuthenticated={Boolean(user)}
        />
        <StatusMessage toast={toast} />

        <div className="flex flex-col gap-6">
          <SummaryPanels
            activeGoals={activeGoals}
            fixedSchedules={fixedSchedules}
          />
          <WeeklyCompletionPanel
            date={selectedDate}
            revision={statisticsRevision}
            onDateChange={selectDate}
          />
          <ConfirmedSchedulePanel
            key={selectedDate}
            confirmed={confirmed?.date === selectedDate ? confirmed : null}
            onCreateSchedule={openScheduleGenerationPage}
            onUpdateScheduleItem={updateConfirmedScheduleItem}
            onDeleteScheduleItem={deleteConfirmedScheduleItem}
            onChangeCompletion={changeCompletion}
            completionPending={completionPending}
          />
          {confirmed && confirmed.date === selectedDate && (
            <ScheduleChatPanel
              key={`${confirmed.confirmedScheduleId}-${confirmed.date}`}
              confirmed={confirmed}
              disabled={completionPending}
              onApplied={(updated) => {
                setConfirmed((current) => current?.confirmedScheduleId === updated.confirmedScheduleId
                  && updated.date === selectedDateRef.current ? updated : current);
                setStatisticsRevision((value) => value + 1);
              }}
            />
          )}
          <FeedbackPanel key={selectedDate} date={selectedDate} />
        </div>
      </div>
    </main>
  );
}
