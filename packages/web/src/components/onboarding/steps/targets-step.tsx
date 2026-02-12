import { Button, Input, Label } from "../../ui";
import type { ProfileFormState } from "../form";

type TargetsStepProps = {
  form: ProfileFormState;
  onChange: (patch: Partial<ProfileFormState>) => void;
  onAutoCalculate: () => void;
};

export function TargetsStep({
  form,
  onChange,
  onAutoCalculate,
}: TargetsStepProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-surface/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Targets</h3>
          <p className="text-sm text-muted-foreground">
            Auto-calculate and adjust if needed.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onAutoCalculate}>
          Calculate Targets
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field-grid">
          <Label htmlFor="calories">Calorie Target (kcal)</Label>
          <Input
            id="calories"
            type="number"
            min="0"
            step="1"
            value={form.calorieTarget}
            onChange={(event) => onChange({ calorieTarget: event.target.value })}
          />
        </div>

        <div className="field-grid">
          <Label htmlFor="protein">Protein Target (g)</Label>
          <Input
            id="protein"
            type="number"
            min="0"
            step="1"
            value={form.proteinTarget}
            onChange={(event) => onChange({ proteinTarget: event.target.value })}
          />
        </div>

        <div className="field-grid">
          <Label htmlFor="carbs">Carb Target (g)</Label>
          <Input
            id="carbs"
            type="number"
            min="0"
            step="1"
            value={form.carbTarget}
            onChange={(event) => onChange({ carbTarget: event.target.value })}
          />
        </div>

        <div className="field-grid">
          <Label htmlFor="fat">Fat Target (g)</Label>
          <Input
            id="fat"
            type="number"
            min="0"
            step="1"
            value={form.fatTarget}
            onChange={(event) => onChange({ fatTarget: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
