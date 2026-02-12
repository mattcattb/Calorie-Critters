import { cn } from "../../lib/cn";

type StepProgressProps = {
  steps: string[];
  currentStep: number;
};

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <div
            key={label}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              isActive && "border-primary/25 bg-primary/15 text-foreground",
              isComplete && "border-success/45 bg-success/10 text-foreground",
              !isActive && !isComplete && "border-border/75 bg-surface-2 text-muted-foreground",
            )}
          >
            <span className="micro-text mr-1">{index + 1}</span>
            {label}
          </div>
        );
      })}
    </div>
  );
}
