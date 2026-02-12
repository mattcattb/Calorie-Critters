import { ACTIVITY_LEVELS, GOALS, SEX_OPTIONS, type ActivityLevel, type Goal, type Sex } from "@calorie-critters/shared";
import { Label, Select } from "../../ui";
import type { ProfileFormState } from "../form";
import { formatEnumLabel } from "../form";

type LifestyleStepProps = {
  form: ProfileFormState;
  onChange: (patch: Partial<ProfileFormState>) => void;
};

export function LifestyleStep({ form, onChange }: LifestyleStepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="field-grid">
        <Label htmlFor="sex">Sex</Label>
        <Select
          id="sex"
          value={form.sex}
          onChange={(event) =>
            onChange({ sex: event.target.value as Sex | "" })
          }
        >
          <option value="">Select sex</option>
          {SEX_OPTIONS.map((sex) => (
            <option key={sex} value={sex}>
              {formatEnumLabel(sex)}
            </option>
          ))}
        </Select>
      </div>

      <div className="field-grid">
        <Label htmlFor="activityLevel">Activity Level</Label>
        <Select
          id="activityLevel"
          value={form.activityLevel}
          onChange={(event) =>
            onChange({ activityLevel: event.target.value as ActivityLevel | "" })
          }
        >
          <option value="">Select activity</option>
          {ACTIVITY_LEVELS.map((activity) => (
            <option key={activity} value={activity}>
              {formatEnumLabel(activity)}
            </option>
          ))}
        </Select>
      </div>

      <div className="field-grid sm:col-span-2">
        <Label htmlFor="goal">Goal</Label>
        <Select
          id="goal"
          value={form.goal}
          onChange={(event) =>
            onChange({ goal: event.target.value as Goal | "" })
          }
        >
          <option value="">Select goal</option>
          {GOALS.map((goal) => (
            <option key={goal} value={goal}>
              {formatEnumLabel(goal)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
