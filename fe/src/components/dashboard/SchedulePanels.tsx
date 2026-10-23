import { useState } from "react";
import Link from "next/link";
import {
  ListEmpty,
  Panel,
} from "@/components/dashboard/FormControls";
import { CircularTimetable } from "@/components/dashboard/Timeline";
import type {
  ConfirmedSchedule,
  FixedSchedule,
  Goal,
  ScheduleItem,
} from "@/types/scheduler";

const moreLinkClass =
  "text-sm font-semibold text-blue-600 transition hover:text-slate-950";

export function SummaryPanels({
  activeGoals,
  fixedSchedules,
}: {
  activeGoals: Goal[];
  fixedSchedules: FixedSchedule[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel
        title="활성 목표"
        action={
          <Link href="/goals/new" className={moreLinkClass}>
            더보기
          </Link>
        }
      >
        <ListEmpty show={activeGoals.length === 0} text="목표가 없습니다." />
        <div className="flex flex-col gap-2">
          {activeGoals.map((goal) => (
            <div
              key={goal.goalId}
              className="rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <strong>{goal.title}</strong>
                <span className="text-xs font-semibold text-blue-600">
                  {goal.priority}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {goal.description || "설명 없음"}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="고정 일정"
        action={
          <Link href="/fixed-schedules/new" className={moreLinkClass}>
            더보기
          </Link>
        }
      >
        <ListEmpty
          show={fixedSchedules.length === 0}
          text="고정 일정이 없습니다."
        />
        <div className="flex flex-col gap-2">
          {fixedSchedules.map((schedule) => (
            <div
              key={schedule.fixedScheduleId}
              className="rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <strong>{schedule.title}</strong>
                <span className="text-xs font-semibold text-blue-600">
                  {schedule.dayOfWeek}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {schedule.startTime.slice(0, 5)} -{" "}
                {schedule.endTime.slice(0, 5)} · {schedule.category}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ConfirmedSchedulePanel({
  confirmed,
  onCreateSchedule,
  onUpdateScheduleItem,
  onDeleteScheduleItem,
  onChangeCompletion,
  completionPending,
}: {
  confirmed: ConfirmedSchedule | null;
  onCreateSchedule: () => void;
  onUpdateScheduleItem: (index: number, item: ScheduleItem) => Promise<void>;
  onDeleteScheduleItem: (index: number) => Promise<void>;
  onChangeCompletion: (itemId: number, completed: boolean) => Promise<void>;
  completionPending: boolean;
}) {
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(
    null,
  );

  return (
    <Panel
      title="확정된 당일 일정"
      action={
        selectedScheduleIndex !== null ? (
          <button
            type="button"
            aria-label="원형 시간표로 돌아가기"
            onClick={() => setSelectedScheduleIndex(null)}
            className="text-xl font-bold leading-none text-blue-600 transition hover:text-slate-950"
          >
            ←
          </button>
        ) : null
      }
    >
      {confirmed ? (
        <>
        <div className="mb-4 rounded-2xl bg-blue-50 p-4">
          <p className="font-semibold text-blue-900" aria-live="polite">
            {confirmed.date} 완료 {confirmed.items.filter((item) => item.completed).length} / {confirmed.items.length}개
          </p>
          <p className="mt-1 text-xs text-slate-600">휴식과 고정 일정을 포함한 전체 일정 기준입니다.</p>
        </div>
        <CircularTimetable
          selectedIndex={selectedScheduleIndex}
          onSelectedIndexChange={setSelectedScheduleIndex}
          onUpdateItem={async (index, item) => {
            await onUpdateScheduleItem(index, item);
            setSelectedScheduleIndex(null);
          }}
          onDeleteItem={async (index) => {
            await onDeleteScheduleItem(index);
            setSelectedScheduleIndex(null);
          }}
          items={confirmed.items.map((item) => ({
            ...item,
            goalId: item.goalId,
            fixedScheduleId: item.fixedScheduleId,
          }))}
        />
        <div className="mt-5 flex flex-col gap-2" aria-label="일정 완료 체크">
          {confirmed.items.map((item) => (
            <label key={item.scheduleItemId} className={`flex items-center gap-3 rounded-2xl border p-3 ${item.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
              <input
                type="checkbox"
                checked={item.completed}
                disabled={completionPending}
                aria-label={`${item.title} 완료`}
                onChange={(event) => void onChangeCompletion(item.scheduleItemId, event.target.checked)}
                className="size-5 shrink-0 accent-emerald-600"
              />
              <span className="min-w-0 flex-1">
                <span className={`block font-semibold ${item.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>{item.title}</span>
                <span className="text-xs text-slate-500">{item.startTime.slice(0, 5)} – {item.endTime.slice(0, 5)}</span>
              </span>
              <span className={`shrink-0 text-xs font-semibold ${item.completed ? "text-emerald-700" : "text-slate-500"}`}>{item.completed ? "완료" : "미완료"}</span>
            </label>
          ))}
        </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-500">
            아직 확정된 일정이 없습니다.
          </p>
          <div>
            <button
              type="button"
              onClick={onCreateSchedule}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              일정 생성
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
