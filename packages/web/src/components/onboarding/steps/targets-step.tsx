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
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6">
      <div className="rounded-[1rem] bg-indigo-50 p-3">
        <Button type="button" className="h-12 w-full rounded-[0.9rem]" onClick={onAutoCalculate}>
          Use Recommended Targets
        </Button>
      </div>

      <div className="space-y-1 border-b border-slate-100 pb-5">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">Daily Calories</p>
        <Input
          id="calories"
          type="number"
          min="0"
          step="1"
          value={form.calorieTarget}
          onChange={(event) => onChange({ calorieTarget: event.target.value })}
          className="h-auto border-0 bg-transparent px-0 py-0 text-6xl font-black text-indigo-600 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="field-grid">
          <Label htmlFor="protein">Protein</Label>
          <Input
            id="protein"
            type="number"
            min="0"
            step="1"
            value={form.proteinTarget}
            onChange={(event) => onChange({ proteinTarget: event.target.value })}
            className="h-14 rounded-[1rem] bg-slate-50 text-2xl font-black"
          />
        </div>

        <div className="field-grid">
          <Label htmlFor="carbs">Carbs</Label>
          <Input
            id="carbs"
            type="number"
            min="0"
            step="1"
            value={form.carbTarget}
            onChange={(event) => onChange({ carbTarget: event.target.value })}
            className="h-14 rounded-[1rem] bg-slate-50 text-2xl font-black"
          />
        </div>

        <div className="field-grid">
          <Label htmlFor="fat">Fats</Label>
          <Input
            id="fat"
            type="number"
            min="0"
            step="1"
            value={form.fatTarget}
            onChange={(event) => onChange({ fatTarget: event.target.value })}
            className="h-14 rounded-[1rem] bg-slate-50 text-2xl font-black"
          />
        </div>
      </div>
    </div>
  );
}
