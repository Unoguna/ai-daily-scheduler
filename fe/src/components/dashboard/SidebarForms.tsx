import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  Input,
  NumberField,
  Panel,
  Select,
  SubmitButton,
  TextArea,
} from "@/components/dashboard/FormControls";
import type {
  ConditionForm,
  DayOfWeek,
  EmotionState,
  FixedScheduleForm,
  GoalForm,
  GoalPriority,
  ScheduleCategory,
} from "@/types/scheduler";

export function SidebarForms({
  conditionForm,
  goalForm,
  fixedForm,
  setConditionForm,
  setGoalForm,
  setFixedForm,
  onCreateCondition,
  onCreateGoal,
  onCreateFixedSchedule,
}: {
  conditionForm: ConditionForm;
  goalForm: GoalForm;
  fixedForm: FixedScheduleForm;
  setConditionForm: Dispatch<SetStateAction<ConditionForm>>;
  setGoalForm: Dispatch<SetStateAction<GoalForm>>;
  setFixedForm: Dispatch<SetStateAction<FixedScheduleForm>>;
  onCreateCondition: (event: FormEvent) => void;
  onCreateGoal: (event: FormEvent) => void;
  onCreateFixedSchedule: (event: FormEvent) => void;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <Panel title="당일 컨디션">
        <form onSubmit={onCreateCondition} className="flex flex-col gap-3">
          <NumberField
            label="피로도"
            value={conditionForm.fatigueLevel}
            onChange={(value) =>
              setConditionForm((form) => ({ ...form, fatigueLevel: value }))
            }
          />
          <NumberField
            label="집중도"
            value={conditionForm.focusLevel}
            onChange={(value) =>
              setConditionForm((form) => ({ ...form, focusLevel: value }))
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
        <form onSubmit={onCreateGoal} className="flex flex-col gap-3">
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
        <form onSubmit={onCreateFixedSchedule} className="flex flex-col gap-3">
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
                setFixedForm((form) => ({ ...form, startTime: `${value}:00` }))
              }
            />
            <Input
              label="종료"
              type="time"
              value={fixedForm.endTime.slice(0, 5)}
              onChange={(value) =>
                setFixedForm((form) => ({ ...form, endTime: `${value}:00` }))
              }
            />
          </div>
          <SubmitButton label="고정 일정 추가" />
        </form>
      </Panel>
    </aside>
  );
}
