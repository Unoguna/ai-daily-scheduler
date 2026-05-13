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
import { SidebarForms } from "@/components/dashboard/SidebarForms";
import { request, today } from "@/lib/schedulerApi";
import type {
  ConfirmedSchedule,
  EmotionState,
  FixedScheduleForm,
  FixedSchedule,
  GeneratedSchedule,
  Goal,
  GoalPriority,
  ScheduleCategory,
  ScheduleItem,
} from "@/types/scheduler";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [generated, setGenerated] = useState<GeneratedSchedule | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedSchedule | null>(null);

  const [conditionForm, setConditionForm] = useState({
    fatigueLevel: 3,
    focusLevel: 3,
    emotionState: "NEUTRAL" as EmotionState,
    memo: "",
  });
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as GoalPriority,
    targetDate: selectedDate,
  });
  const [fixedForm, setFixedForm] = useState<FixedScheduleForm>({
    dayOfWeek: "MONDAY",
    title: "",
    category: "STUDY" as ScheduleCategory,
    startTime: "09:00:00",
    endTime: "10:00:00",
    mandatory: true,
  });
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
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedDate]);

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setLoading(true);
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "요청에 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    await run(async () => {
      const [goalList, fixedList] = await Promise.all([
        request<Goal[]>("/api/v1/goals"),
        request<FixedSchedule[]>("/api/v1/schedules/fixed-schedules"),
      ]);
      setGoals(goalList);
      setFixedSchedules(fixedList);

      try {
        const dailySchedule = await request<ConfirmedSchedule>(
          `/api/v1/schedules?date=${selectedDate}`,
        );
        setConfirmed(dailySchedule);
      } catch {
        setConfirmed(null);
      }
    }, "데이터를 불러왔습니다.");
  };

  const saveToken = () => {
    localStorage.setItem("accessToken", token);
    void loadDashboard();
  };

  const createCondition = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await request<{ id: number }>("/api/v1/daily-conditions", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          fatigueLevel: Number(conditionForm.fatigueLevel),
          focusLevel: Number(conditionForm.focusLevel),
          emotionState: conditionForm.emotionState,
          memo: conditionForm.memo || null,
        }),
      });
    }, "당일 컨디션을 저장했습니다.");
  };

  const createGoal = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await request<{ id: number }>("/api/v1/goals", {
        method: "POST",
        body: JSON.stringify({
          title: goalForm.title,
          description: goalForm.description || null,
          priority: goalForm.priority,
          targetDate: goalForm.targetDate || null,
        }),
      });
      setGoalForm((form) => ({ ...form, title: "", description: "" }));
      const goalList = await request<Goal[]>("/api/v1/goals");
      setGoals(goalList);
    }, "목표를 추가했습니다.");
  };

  const createFixedSchedule = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await request<{ id: number }>("/api/v1/schedules/fixed-schedules", {
        method: "POST",
        body: JSON.stringify(fixedForm),
      });
      setFixedForm((form) => ({ ...form, title: "" }));
      const fixedList = await request<FixedSchedule[]>(
        "/api/v1/schedules/fixed-schedules",
      );
      setFixedSchedules(fixedList);
    }, "고정 일정을 추가했습니다.");
  };

  const generateSchedule = () => {
    void run(async () => {
      const schedule = await request<GeneratedSchedule>(
        `/api/v1/schedules/generate?date=${selectedDate}`,
        { method: "POST" },
      );
      setGenerated(schedule);
    }, "일정 초안을 생성했습니다.");
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

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6">
        <DashboardHeader
          token={token}
          onTokenChange={setToken}
          onSaveToken={saveToken}
        />
        <DateToolbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onRefresh={() => void loadDashboard()}
        />
        <StatusMessage loading={loading} message={message} />

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <SidebarForms
            conditionForm={conditionForm}
            goalForm={goalForm}
            fixedForm={fixedForm}
            setConditionForm={setConditionForm}
            setGoalForm={setGoalForm}
            setFixedForm={setFixedForm}
            onCreateCondition={createCondition}
            onCreateGoal={createGoal}
            onCreateFixedSchedule={createFixedSchedule}
          />

          <section className="flex flex-col gap-6">
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
          </section>
        </div>
      </div>
    </main>
  );
}
