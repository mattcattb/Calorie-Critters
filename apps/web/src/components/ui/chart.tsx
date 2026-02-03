import type { CSSProperties, PropsWithChildren } from "react";
import { Tooltip as RechartsTooltip } from "recharts";
import { cn } from "../../lib/cn";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface ChartContainerProps extends PropsWithChildren {
  config: ChartConfig;
  className?: string;
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  const style = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[`--chart-${key}`] = value.color;
      return acc;
    },
    {}
  );

  return (
    <div
      className={cn("w-full", className)}
      style={style as CSSProperties}
    >
      {children}
    </div>
  );
}

export const ChartTooltip = RechartsTooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>; 
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface/95 px-3 py-2 text-xs shadow-lg">
      {label ? <div className="mb-1 text-muted-foreground">{label}</div> : null}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={`${item.name ?? "value"}-${index}`} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{item.name ?? "Value"}</span>
            <span className="font-semibold text-foreground">
              {typeof item.value === "number" ? item.value.toFixed(2) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
