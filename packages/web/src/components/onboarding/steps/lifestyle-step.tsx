import { GOALS, type Goal } from "@calorie-critters/shared";
import { Button } from "../../ui";
import type { ProfileFormState } from "../form";

type LifestyleStepProps = {
  form: ProfileFormState;
  onChange: (patch: Partial<ProfileFormState>) => void;
};

export function LifestyleStep({ form, onChange }: LifestyleStepProps) {
  const goalLabel = (goal: Goal): string => {
    if (goal === "lose") return "Lose Weight";
    if (goal === "gain") return "Gain Muscle";
    return "Maintain Weight";
  };

  return (
    <div className="grid gap-3">
      {GOALS.map((goal) => {
        const selected = form.goal === goal;
        return (
          <Button
            key={goal}
            type="button"
            variant={selected ? "primary" : "outline"}
            className="h-14 justify-start rounded-2xl px-5 text-base font-bold"
            onClick={() => onChange({ goal: goal as Goal })}
          >
            {goalLabel(goal)}
          </Button>
        );
      })}
      <p className="pt-1 text-sm text-muted-foreground">
        Choose your primary goal for target recommendations.
      </p>
    </div>
  );
}
