import { ACTIVITY_LEVELS, SEX_OPTIONS, type ActivityLevel, type Sex } from "@calorie-critters/shared";
import { Input, Label, Select } from "../../ui";
import type { ProfileFormState } from "../form";
import { formatEnumLabel } from "../form";

type BasicsStepProps = {
  form: ProfileFormState;
  onChange: (patch: Partial<ProfileFormState>) => void;
};

export function BasicsStep({ form, onChange }: BasicsStepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="field-grid">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min="1"
          step="1"
          value={form.age}
          onChange={(event) => onChange({ age: event.target.value })}
          placeholder="28"
        />
      </div>

      <div className="field-grid">
        <Label htmlFor="sex">Gender</Label>
        <Select
          id="sex"
          value={form.sex}
          onChange={(event) => onChange({ sex: event.target.value as Sex | "" })}
        >
          <option value="">Select gender</option>
          {SEX_OPTIONS.map((sex) => (
            <option key={sex} value={sex}>
              {formatEnumLabel(sex)}
            </option>
          ))}
        </Select>
      </div>

      <div className="field-grid">
        <Label htmlFor="heightFeet">Height (feet)</Label>
        <Input
          id="heightFeet"
          type="number"
          step="1"
          min="0"
          value={form.heightFeet}
          onChange={(event) => onChange({ heightFeet: event.target.value })}
          placeholder="5"
        />
      </div>

      <div className="field-grid">
        <Label htmlFor="heightInches">Height (inches)</Label>
        <Input
          id="heightInches"
          type="number"
          step="1"
          min="0"
          max="11"
          value={form.heightInches}
          onChange={(event) => onChange({ heightInches: event.target.value })}
          placeholder="10"
        />
      </div>

      <div className="field-grid">
        <Label htmlFor="weight">Weight (lbs)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="0"
          value={form.weight}
          onChange={(event) => onChange({ weight: event.target.value })}
          placeholder="160"
        />
      </div>

      <div className="field-grid sm:col-span-2">
        <Label htmlFor="activityLevel">Activity Level</Label>
        <Select
          id="activityLevel"
          value={form.activityLevel}
          onChange={(event) => onChange({ activityLevel: event.target.value as ActivityLevel | "" })}
        >
          <option value="">Select activity</option>
          {ACTIVITY_LEVELS.map((activity) => (
            <option key={activity} value={activity}>
              {formatEnumLabel(activity)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
