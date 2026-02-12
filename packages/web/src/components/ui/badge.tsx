import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../lib/cn";

const badgeStyles = tv({
  base: "inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs font-semibold",
  variants: {
    variant: {
      primary: "border-primary/20 bg-primary/15 text-primary",
      neutral: "border-border/75 bg-surface-2 text-muted-foreground",
      success: "border-success/20 bg-success/15 text-success",
      warning: "border-warning/20 bg-warning/18 text-warning",
      danger: "border-danger/20 bg-danger/15 text-danger",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeStyles>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ variant }), className)} {...props} />;
}
