"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

type GoalPriority = "LOW" | "MEDIUM" | "HIGH";
type GoalStatus = "ACTIVE" | "COMPLETED" | "INACTIVE";
type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
type ScheduleCategory =
  | "CLASS"
  | "STUDY"
  | "EXERCISE"
  | "WORK"
  | "MEETING"
  | "PERSONAL"
  | "OTHER";
type ScheduleItemType = "FIXED_SCHEDULE" | "GOAL_WORK" | "BREAK";
type EmotionState = "VERY_BAD" | "BAD" | "NEUTRAL" | "GOOD" | "VERY_GOOD";

type Goal = {
  goalId: number;
  title: string;
  description: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  targetDate: string | null;
};

type FixedSchedule = {
  fixedScheduleId: number;
  dayOfWeek: DayOfWeek;
  title: string;
  category: ScheduleCategory;
  startTime: string;
  endTime: string;
  mandatory: boolean;
};

type ScheduleItem = {
  type: ScheduleItemType;
  title: string;
  startTime: string;
  endTime: string;
  goalId: number | null;
  fixedScheduleId: number | null;
  description: string | null;
};

type GeneratedSchedule = {
  date: string;
  sessionMinutes: number;
  breakMinutes: number;
  items: ScheduleItem[];
};

type ConfirmedSchedule = {
  confirmedScheduleId: number;
  date: string;
  items: Array<ScheduleItem & { scheduleItemId: number; sequence: number }>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const today = () => new Date().toISOString().slice(0, 10);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok || body?.success === false) {
    throw new Error(body?.message ?? text ?? "Request failed");
  }

  return (body as ApiResponse<T>).data;
}

export default function Home() {
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
  const [fixedForm, setFixedForm] = useState({
    dayOfWeek: "MONDAY" as DayOfWeek,
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
    setToken(savedToken);
  }, []);

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
      setMessage(error instanceof Error ? error.message : "요청에 실패했습니다.");
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
        <header className="flex flex-col gap-4 border-b border-[#d7d9cf] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#577060]">Haru Planner</p>
            <h1 className="text-3xl font-bold">하루 일정 코치</h1>
          </div>
          <div className="flex flex-col gap-2 md:w-[520px]">
            <label className="text-sm font-semibold">Access Token</label>
            <div className="flex gap-2">
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-[#c8cbbf] bg-white px-3 py-2 text-sm"
                placeholder="로그인 후 accessToken이 자동 저장됩니다."
              />
              <button
                type="button"
                onClick={saveToken}
                className="rounded-md bg-[#243528] px-4 py-2 text-sm font-semibold text-white"
              >
                저장
              </button>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">날짜</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
            >
              새로고침
            </button>
            <a
              href="/login"
              className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold"
            >
              로그인
            </a>
          </div>
        </section>

        {message ? (
          <div className="rounded-md border border-[#c8cbbf] bg-white px-4 py-3 text-sm">
            {loading ? "처리 중..." : message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="flex flex-col gap-6">
            <Panel title="당일 컨디션">
              <form onSubmit={createCondition} className="flex flex-col gap-3">
                <NumberField
                  label="피로도"
                  value={conditionForm.fatigueLevel}
                  onChange={(value) =>
                    setConditionForm((form) => ({
                      ...form,
                      fatigueLevel: value,
                    }))
                  }
                />
                <NumberField
                  label="집중도"
                  value={conditionForm.focusLevel}
                  onChange={(value) =>
                    setConditionForm((form) => ({
                      ...form,
                      focusLevel: value,
                    }))
                  }
                />
                <Select
                  label="감정"
                  value={conditionForm.emotionState}
                  options={["VERY_BAD", "BAD", "NEUTRAL", "GOOD", "VERY_GOOD"]}
                  onChange={(value) =>
                    setConditionForm((form) => ({
                      ...form,
                      emotionState: value as EmotionState,
                    }))
                  }
                />
                <TextArea
                  label="메모"
                  value={conditionForm.memo}
                  onChange={(value) =>
                    setConditionForm((form) => ({ ...form, memo: value }))
                  }
                />
                <SubmitButton label="컨디션 저장" />
              </form>
            </Panel>

            <Panel title="목표 추가">
              <form onSubmit={createGoal} className="flex flex-col gap-3">
                <Input
                  label="제목"
                  value={goalForm.title}
                  onChange={(value) =>
                    setGoalForm((form) => ({ ...form, title: value }))
                  }
                  required
                />
                <TextArea
                  label="설명"
                  value={goalForm.description}
                  onChange={(value) =>
                    setGoalForm((form) => ({ ...form, description: value }))
                  }
                />
                <Select
                  label="우선순위"
                  value={goalForm.priority}
                  options={["LOW", "MEDIUM", "HIGH"]}
                  onChange={(value) =>
                    setGoalForm((form) => ({
                      ...form,
                      priority: value as GoalPriority,
                    }))
                  }
                />
                <Input
                  label="마감일"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(value) =>
                    setGoalForm((form) => ({ ...form, targetDate: value }))
                  }
                />
                <SubmitButton label="목표 추가" />
              </form>
            </Panel>

            <Panel title="고정 일정 추가">
              <form onSubmit={createFixedSchedule} className="flex flex-col gap-3">
                <Select
                  label="요일"
                  value={fixedForm.dayOfWeek}
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
                    setFixedForm((form) => ({
                      ...form,
                      dayOfWeek: value as DayOfWeek,
                    }))
                  }
                />
                <Input
                  label="제목"
                  value={fixedForm.title}
                  onChange={(value) =>
                    setFixedForm((form) => ({ ...form, title: value }))
                  }
                  required
                />
                <Select
                  label="카테고리"
                  value={fixedForm.category}
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
                    setFixedForm((form) => ({
                      ...form,
                      category: value as ScheduleCategory,
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="시작"
                    type="time"
                    value={fixedForm.startTime.slice(0, 5)}
                    onChange={(value) =>
                      setFixedForm((form) => ({
                        ...form,
                        startTime: `${value}:00`,
                      }))
                    }
                  />
                  <Input
                    label="종료"
                    type="time"
                    value={fixedForm.endTime.slice(0, 5)}
                    onChange={(value) =>
                      setFixedForm((form) => ({
                        ...form,
                        endTime: `${value}:00`,
                      }))
                    }
                  />
                </div>
                <SubmitButton label="고정 일정 추가" />
              </form>
            </Panel>
          </aside>

          <section className="flex flex-col gap-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="활성 목표">
                <ListEmpty show={activeGoals.length === 0} text="목표가 없습니다." />
                <div className="flex flex-col gap-2">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.goalId}
                      className="rounded-md border border-[#d7d9cf] bg-white p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <strong>{goal.title}</strong>
                        <span className="text-xs font-semibold text-[#577060]">
                          {goal.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#66705f]">
                        {goal.description || "설명 없음"}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="고정 일정">
                <ListEmpty
                  show={fixedSchedules.length === 0}
                  text="고정 일정이 없습니다."
                />
                <div className="flex flex-col gap-2">
                  {fixedSchedules.map((schedule) => (
                    <div
                      key={schedule.fixedScheduleId}
                      className="rounded-md border border-[#d7d9cf] bg-white p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <strong>{schedule.title}</strong>
                        <span className="text-xs font-semibold text-[#577060]">
                          {schedule.dayOfWeek}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#66705f]">
                        {schedule.startTime.slice(0, 5)} -{" "}
                        {schedule.endTime.slice(0, 5)} · {schedule.category}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title="일정 생성과 확정">
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateSchedule}
                  className="rounded-md bg-[#243528] px-4 py-2 text-sm font-semibold text-white"
                >
                  일정 생성
                </button>
                <button
                  type="button"
                  onClick={confirmSchedule}
                  disabled={!generated}
                  className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  생성안 확정
                </button>
              </div>
              {generated ? (
                <TimelineEditor
                  items={generated.items}
                  onChange={updateGeneratedItem}
                />
              ) : (
                <p className="text-sm text-[#66705f]">
                  생성 버튼을 누르면 프런트에서 수정 가능한 일정 초안이 표시됩니다.
                </p>
              )}
            </Panel>

            <Panel title="확정된 당일 일정">
              {confirmed ? (
                <Timeline
                  items={confirmed.items.map((item) => ({
                    ...item,
                    goalId: item.goalId,
                    fixedScheduleId: item.fixedScheduleId,
                  }))}
                />
              ) : (
                <p className="text-sm text-[#66705f]">
                  아직 확정된 일정이 없습니다.
                </p>
              )}
            </Panel>

            <Panel title="하루 피드백">
              <form onSubmit={submitFeedback} className="flex flex-col gap-3">
                <NumberField
                  label="만족도"
                  value={feedbackForm.satisfactionScore}
                  onChange={(value) =>
                    setFeedbackForm((form) => ({
                      ...form,
                      satisfactionScore: value,
                    }))
                  }
                />
                <TextArea
                  label="피드백"
                  value={feedbackForm.rawFeedback}
                  onChange={(value) =>
                    setFeedbackForm((form) => ({
                      ...form,
                      rawFeedback: value,
                    }))
                  }
                  required
                />
                <SubmitButton label="피드백 저장" />
              </form>
            </Panel>
          </section>
        </div>
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-[#d7d9cf] bg-[#fbfcf7] p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <textarea
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-20 rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input
        type="number"
        min={1}
        max={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal"
      />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="rounded-md bg-[#577060] px-4 py-2 text-sm font-semibold text-white"
    >
      {label}
    </button>
  );
}

function ListEmpty({ show, text }: { show: boolean; text: string }) {
  return show ? <p className="text-sm text-[#66705f]">{text}</p> : null;
}

function Timeline({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          key={`${item.startTime}-${item.title}-${index}`}
          className="grid gap-2 rounded-md border border-[#d7d9cf] bg-white p-3 md:grid-cols-[110px_1fr]"
        >
          <div className="text-sm font-bold text-[#577060]">
            {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <strong>{item.title}</strong>
              <span className="text-xs font-semibold text-[#66705f]">
                {item.type}
              </span>
            </div>
            {item.description ? (
              <p className="mt-1 text-sm text-[#66705f]">{item.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineEditor({
  items,
  onChange,
}: {
  items: ScheduleItem[];
  onChange: (index: number, key: keyof ScheduleItem, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={`${item.startTime}-${item.title}-${index}`}
          className="grid gap-3 rounded-md border border-[#d7d9cf] bg-white p-3 md:grid-cols-[130px_1fr]"
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            <input
              type="time"
              value={item.startTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "startTime", `${event.target.value}:00`)
              }
              className="rounded-md border border-[#c8cbbf] px-2 py-2 text-sm"
            />
            <input
              type="time"
              value={item.endTime.slice(0, 5)}
              onChange={(event) =>
                onChange(index, "endTime", `${event.target.value}:00`)
              }
              className="rounded-md border border-[#c8cbbf] px-2 py-2 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <input
              value={item.title}
              onChange={(event) => onChange(index, "title", event.target.value)}
              className="rounded-md border border-[#c8cbbf] px-3 py-2 font-semibold"
            />
            <input
              value={item.description ?? ""}
              onChange={(event) =>
                onChange(index, "description", event.target.value)
              }
              className="rounded-md border border-[#c8cbbf] px-3 py-2 text-sm"
              placeholder="설명"
            />
            <span className="text-xs font-semibold text-[#66705f]">
              {item.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
