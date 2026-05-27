import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ListEmpty,
  NumberField,
  Panel,
  SubmitButton,
  TextArea,
} from "@/components/dashboard/FormControls";
import { CircularTimetable } from "@/components/dashboard/Timeline";
import type {
  ConfirmedSchedule,
  FeedbackForm,
  FixedSchedule,
  Goal,
  ScheduleItem,
} from "@/types/scheduler";

const moreLinkClass =
  "text-sm font-semibold text-[#577060] transition hover:text-[#243528]";

export function SummaryPanels({
  activeGoals,
  fixedSchedules,
}: {
  activeGoals: Goal[];
  fixedSchedules: FixedSchedule[];
}) {
  return (
    <div className="grid gap-6">
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
  );
}

export function ConfirmedSchedulePanel({
  confirmed,
  onCreateSchedule,
  onUpdateScheduleItem,
  onDeleteScheduleItem,
}: {
  confirmed: ConfirmedSchedule | null;
  onCreateSchedule: () => void;
  onUpdateScheduleItem: (index: number, item: ScheduleItem) => Promise<void>;
  onDeleteScheduleItem: (index: number) => Promise<void>;
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
            className="text-xl font-bold leading-none text-[#577060] transition hover:text-[#243528]"
          >
            ←
          </button>
        ) : null
      }
    >
      {confirmed ? (
        <CircularTimetable
          selectedIndex={selectedScheduleIndex}
          onSelectedIndexChange={setSelectedScheduleIndex}
          onUpdateItem={onUpdateScheduleItem}
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
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#66705f]">
            아직 확정된 일정이 없습니다.
          </p>
          <div>
            <button
              type="button"
              onClick={onCreateSchedule}
              className="rounded-md bg-[#243528] px-4 py-2 text-sm font-semibold text-white"
            >
              일정 생성
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

export function FeedbackPanel({
  feedbackForm,
  setFeedbackForm,
  onSubmitFeedback,
}: {
  feedbackForm: FeedbackForm;
  setFeedbackForm: Dispatch<SetStateAction<FeedbackForm>>;
  onSubmitFeedback: (event: FormEvent) => void;
}) {
  return (
    <Panel title="하루 피드백">
      <form onSubmit={onSubmitFeedback} className="flex flex-col gap-3">
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
            setFeedbackForm((form) => ({ ...form, rawFeedback: value }))
          }
          required
        />
        <SubmitButton label="피드백 저장" />
      </form>
    </Panel>
  );
}
