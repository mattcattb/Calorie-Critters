import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const inputStyles = cva(
  [
    "flex w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800",
    "placeholder:text-slate-400",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
    "disabled:cursor-not-allowed disabled:opacity-60",
  ],
  {
    variants: {
      size: {
        sm: "h-10",
        md: "h-12",
        lg: "h-14 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputStyles>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputStyles({ size }), className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
