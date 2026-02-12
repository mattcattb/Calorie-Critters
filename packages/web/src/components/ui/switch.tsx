import { Switch as BaseSwitch } from "@base-ui-components/react/switch";
import { cn } from "../../lib/cn";

export type SwitchProps = BaseSwitch.Root.Props & {
  label?: string;
};

export function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-3 text-sm font-semibold text-foreground/90">
      <BaseSwitch.Root
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full border border-border bg-muted shadow-[inset_0_1px_2px_hsl(336_35%_40%/0.16)]",
          "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[checked]:bg-primary data-[checked]:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      >
        <BaseSwitch.Thumb
          className={cn(
            "inline-block h-4 w-4 translate-x-1 rounded-full bg-foreground shadow-[0_1px_2px_hsl(336_36%_28%/0.28)]",
            "transition data-[checked]:translate-x-6 data-[checked]:bg-primary-foreground"
          )}
        />
      </BaseSwitch.Root>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
