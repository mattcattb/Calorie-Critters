import * as React from "react";
import { cn } from "../../lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[104px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors",
        "placeholder:text-slate-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
