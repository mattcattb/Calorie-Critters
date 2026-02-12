import { cn } from "../../lib/cn";

type StepProgressProps = {
  steps: string[];
  currentStep: number;
};

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((label, index) => {
        const isComplete = index <= currentStep;

        return (
          <div
            key={label}
            className={cn(
              "h-2 rounded-full transition",
              isComplete ? "bg-indigo-600" : "bg-slate-200",
            )}
            aria-label={label}
          />
        );
      })}
    </div>
  );
}
