import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import { ListEmpty, NumberField, Panel, SubmitButton, TextArea } from "@/components/dashboard/FormControls";
import { Timeline, TimelineEditor } from "@/components/dashboard/Timeline";
import type {
  ConfirmedSchedule,
  FeedbackForm,
  FixedSchedule,
  GeneratedSchedule,
  Goal,
  ScheduleItem,
} from "@/types/scheduler";

export function SummaryPanels({
  activeGoals,
  fixedSchedules,
}: {
  activeGoals: Goal[];
  fixedSchedules: FixedSchedule[];
}) {
  return (
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
        <div className="mb-3">
          <Link
            href="/fixed-schedules/new"
            className="inline-flex rounded-md bg-[#577060] px-4 py-2 text-sm font-semibold text-white"
          >
            고정 일정 추가
          </Link>
        </div>
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

export function ScheduleGenerationPanel({
  generated,
  onGenerateSchedule,
  onConfirmSchedule,
  onUpdateGeneratedItem,
}: {
  generated: GeneratedSchedule | null;
  onGenerateSchedule: () => void;
  onConfirmSchedule: () => void;
  onUpdateGeneratedItem: (
    index: number,
    key: keyof ScheduleItem,
    value: string,
  ) => void;
}) {
  return (
    <Panel title="일정 생성과 확정">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerateSchedule}
          className="rounded-md bg-[#243528] px-4 py-2 text-sm font-semibold text-white"
        >
          일정 생성
        </button>
        <button
          type="button"
          onClick={onConfirmSchedule}
          disabled={!generated}
          className="rounded-md border border-[#aeb4a5] px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          생성안 확정
        </button>
      </div>
      {generated ? (
        <TimelineEditor
          items={generated.items}
          onChange={onUpdateGeneratedItem}
        />
      ) : (
        <p className="text-sm text-[#66705f]">
          생성 버튼을 누르면 프런트에서 수정 가능한 일정 초안이 표시됩니다.
        </p>
      )}
    </Panel>
  );
}

export function ConfirmedSchedulePanel({
  confirmed,
}: {
  confirmed: ConfirmedSchedule | null;
}) {
  return (
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
