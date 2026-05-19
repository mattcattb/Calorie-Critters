import { ACTIVITY_LEVELS, SEX_OPTIONS, type ActivityLevel, type Sex } from "@calorie-critters/shared";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui";
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
          value={form.sex}
          onValueChange={(value) => onChange({ sex: value as Sex | "" })}
        >
          <SelectTrigger id="sex">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {SEX_OPTIONS.map((sex) => (
              <SelectItem key={sex} value={sex}>
                {formatEnumLabel(sex)}
              </SelectItem>
            ))}
          </SelectContent>
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
          value={form.activityLevel}
          onValueChange={(value) => onChange({ activityLevel: value as ActivityLevel | "" })}
        >
          <SelectTrigger id="activityLevel">
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_LEVELS.map((activity) => (
              <SelectItem key={activity} value={activity}>
                {formatEnumLabel(activity)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
