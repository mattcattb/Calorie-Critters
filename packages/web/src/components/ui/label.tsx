import * as React from "react";
import { cn } from "../../lib/cn";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-semibold tracking-[0.01em] text-foreground/90", className)}
      {...props}
    />
  );
}
