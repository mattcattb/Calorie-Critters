import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../lib/cn";

export const iconStyles = tv({
  base: "shrink-0",
  variants: {
    size: {
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-7 w-7",
      xl: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

type AppIconProps = React.SVGProps<SVGSVGElement> & VariantProps<typeof iconStyles>;

export function AppIcon({ size, className, children, ...props }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(iconStyles({ size }), className)}
      {...props}
    >
      {children}
    </svg>
  );
}
