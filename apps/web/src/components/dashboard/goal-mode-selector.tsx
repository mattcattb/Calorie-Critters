import { Button } from "../ui/button";
import { cn } from "../../lib/cn";

export type GoalMode = "monitor" | "reduce" | "quit";

interface GoalModeSelectorProps {
  mode: GoalMode;
  onChange: (mode: GoalMode) => void;
}

const modes: { value: GoalMode; label: string; description: string }[] = [
  {
    value: "monitor",
    label: "Monitor",
    description: "Track usage without goals",
  },
  {
    value: "reduce",
    label: "Reduce",
    description: "Gradually lower intake",
  },
  {
    value: "quit",
    label: "Quit",
    description: "Work toward nicotine-free",
  },
];

export function GoalModeSelector({ mode, onChange }: GoalModeSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
      {modes.map((m) => (
        <Button
          key={m.value}
          variant="ghost"
          size="sm"
          className={cn(
            "flex-1 text-xs transition-all",
            mode === m.value
              ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChange(m.value)}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
