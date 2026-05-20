import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  NumberField,
  Panel,
  Select,
  SubmitButton,
  TextArea,
} from "@/components/dashboard/FormControls";
import type {
  ConditionForm,
  EmotionState,
} from "@/types/scheduler";

export function SidebarForms({
  conditionForm,
  setConditionForm,
  onCreateCondition,
}: {
  conditionForm: ConditionForm;
  setConditionForm: Dispatch<SetStateAction<ConditionForm>>;
  onCreateCondition: (event: FormEvent) => void;
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

    </aside>
  );
}
