import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../lib/cn";

export const buttonStyles = tv({
  base: [
    "inline-flex items-center justify-center gap-2 rounded-2xl border font-black tracking-tight transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
  ],
  variants: {
    variant: {
      primary:
        "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:brightness-105 active:brightness-95",
      secondary:
        "border-slate-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      outline:
        "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700",
      ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100",
      danger:
        "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
    },
    size: {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    },
    effect: {
      none: "",
      glow: "btn-glow",
      sheen: "btn-sheen",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    effect: "none",
  },
});

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export function Button({
  className,
  variant,
  size,
  effect,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, effect }), className)}
      {...props}
    />
  );
}
