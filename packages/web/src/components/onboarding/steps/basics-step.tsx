import { Input, Label } from "../../ui";
import type { ProfileFormState } from "../form";

type BasicsStepProps = {
  form: ProfileFormState;
  onChange: (patch: Partial<ProfileFormState>) => void;
};

export function BasicsStep({ form, onChange }: BasicsStepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="field-grid">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={form.dateOfBirth}
          onChange={(event) => onChange({ dateOfBirth: event.target.value })}
        />
      </div>

      <div className="field-grid">
        <Label htmlFor="height">Height (inches)</Label>
        <Input
          id="height"
          type="number"
          step="0.1"
          min="0"
          value={form.height}
          onChange={(event) => onChange({ height: event.target.value })}
          placeholder="69"
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
    </div>
  );
}
