import * as React from "react";
import { cn } from "../../lib/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
