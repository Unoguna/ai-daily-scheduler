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
  SchedulingProfileForm,
  EnergyPattern,
} from "@/types/scheduler";

export function SidebarForms({
  conditionForm,
  goalForm,
  fixedForm,
  profileForm,
  setConditionForm,
  setGoalForm,
  setFixedForm,
  setProfileForm,
  onCreateCondition,
  onCreateGoal,
  onCreateFixedSchedule,
  onCreateSchedulingProfile,
}: {
  conditionForm: ConditionForm;
  goalForm: GoalForm;
  fixedForm: FixedScheduleForm;
  profileForm: SchedulingProfileForm;
  setConditionForm: Dispatch<SetStateAction<ConditionForm>>;
  setGoalForm: Dispatch<SetStateAction<GoalForm>>;
  setFixedForm: Dispatch<SetStateAction<FixedScheduleForm>>;
  setProfileForm: Dispatch<SetStateAction<SchedulingProfileForm>>;
  onCreateCondition: (event: FormEvent) => void;
  onCreateGoal: (event: FormEvent) => void;
  onCreateFixedSchedule: (event: FormEvent) => void;
  onCreateSchedulingProfile: (event: FormEvent) => void;
}) {
  return (
    <aside className="flex flex-col gap-6">
      <Panel title="스케줄링 프로필">
        <form
          onSubmit={onCreateSchedulingProfile}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="활동 시작"
              type="time"
              value={profileForm.preferredStartTime.slice(0, 5)}
              onChange={(value) =>
                setProfileForm((form) => ({
                  ...form,
                  preferredStartTime: `${value}:00`,
                }))
              }
            />
            <Input
              label="활동 종료"
              type="time"
              value={profileForm.preferredEndTime.slice(0, 5)}
              onChange={(value) =>
                setProfileForm((form) => ({
                  ...form,
                  preferredEndTime: `${value}:00`,
                }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="기상"
              type="time"
              value={profileForm.wakeUpTime.slice(0, 5)}
              onChange={(value) =>
                setProfileForm((form) => ({
                  ...form,
                  wakeUpTime: `${value}:00`,
                }))
              }
            />
            <Input
              label="취침"
              type="time"
              value={profileForm.sleepTime.slice(0, 5)}
              onChange={(value) =>
                setProfileForm((form) => ({
                  ...form,
                  sleepTime: `${value}:00`,
                }))
              }
            />
          </div>
          <Select
            label="에너지 패턴"
            value={profileForm.energyPattern}
            options={[
              "MORNING_TYPE",
              "AFTERNOON_TYPE",
              "EVENING_TYPE",
              "IRREGULAR",
            ]}
            onChange={(value) =>
              setProfileForm((form) => ({
                ...form,
                energyPattern: value as EnergyPattern,
              }))
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <MinuteField
              label="집중 분"
              min={10}
              max={300}
              value={profileForm.preferredSessionMinutes}
              onChange={(value) =>
                setProfileForm((form) => ({
                  ...form,
                  preferredSessionMinutes: value,
                }))
              }
            />
            <MinuteField
              label="휴식 분"
              min={0}
              max={180}
              value={profileForm.breakMinutes}
              onChange={(value) =>
                setProfileForm((form) => ({ ...form, breakMinutes: value }))
              }
            />
          </div>
          <SubmitButton label="프로필 저장" />
        </form>
      </Panel>

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

function MinuteField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-md border border-[#c8cbbf] bg-white px-3 py-2 font-normal"
      />
    </label>
  );
}
