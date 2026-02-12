import * as React from "react";
import { cn } from "../../lib/cn";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <section className={cn("flex items-end justify-between gap-3", className)}>
      <div className="space-y-1">
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="text-sm font-semibold text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
