import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import type { DeviceType } from "./DeviceSelector";
import {
  CigaretteIcon,
  IqosIcon,
  VapeIcon,
  ZynIcon,
} from "../dashboard/quick-log-buttons";

interface LogEntry {
  id: string;
  time: Date;
  type: DeviceType;
  amount: number;
}

const deviceIcons: Record<DeviceType, ReactNode> = {
  vape: <VapeIcon className="h-4 w-4" />,
  zyn: <ZynIcon className="h-4 w-4" />,
  cigarette: <CigaretteIcon className="h-4 w-4" />,
  iqos: <IqosIcon className="h-4 w-4" />,
};

const deviceColors: Record<DeviceType, string> = {
  vape: "oklch(0.7 0.18 180)",
  zyn: "oklch(0.75 0.15 60)",
  cigarette: "oklch(0.65 0.2 340)",
  iqos: "oklch(0.6 0.15 280)",
};

const deviceNames: Record<DeviceType, string> = {
  vape: "Vape hit",
  zyn: "Zyn pouch",
  cigarette: "Cigarette",
  iqos: "IQOS stick",
};

interface ActivityLogProps {
  entries: LogEntry[];
  onRemove: (id: string) => void;
}

export function ActivityLog({ entries, onRemove }: ActivityLogProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const todayEntries = entries.filter((entry) => {
    const today = new Date();
    return (
      entry.time.getDate() === today.getDate() &&
      entry.time.getMonth() === today.getMonth() &&
      entry.time.getFullYear() === today.getFullYear()
    );
  });

  return (
    <Card className="border-border bg-surface/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-foreground">
            Today&apos;s Activity
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {todayEntries.length} logged
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {todayEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No activity logged today</p>
            <p className="text-xs mt-1">
              Select a device above to start tracking
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {todayEntries
              .sort((a, b) => b.time.getTime() - a.time.getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-background/50 p-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full bg-surface p-2"
                      style={{ color: deviceColors[entry.type] }}
                    >
                      {deviceIcons[entry.type]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {deviceNames[entry.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.amount.toFixed(1)}mg nicotine
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(entry.time)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-danger"
                      onClick={() => onRemove(entry.id)}
                    >
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l10 10M13 3L3 13" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
