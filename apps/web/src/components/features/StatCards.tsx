import { Card, CardContent } from "../ui/card";

interface StatsCardsProps {
  currentLevel: number;
  todayCount: number;
  timeUntilBaseline: number; // in hours
  peakLevel: number;
}

export function StatsCards({
  currentLevel,
  todayCount,
  timeUntilBaseline,
  peakLevel,
}: StatsCardsProps) {
  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const stats = [
    {
      label: "Current Level",
      value: `${currentLevel.toFixed(1)}`,
      unit: "ng/mL",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h4l2.5-6 5 12 2.5-6H21" />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Today's Uses",
      value: todayCount.toString(),
      unit: "total",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      ),
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Time to Baseline",
      value:
        timeUntilBaseline > 0 ? formatTime(timeUntilBaseline) : "At baseline",
      unit: timeUntilBaseline > 0 ? "remaining" : "",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Today's Peak",
      value: `${peakLevel.toFixed(1)}`,
      unit: "ng/mL",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7l6 6 4-4 7 7" />
          <path d="M21 14v7h-7" />
        </svg>
      ),
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-surface/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs text-muted-foreground">
                  {stat.unit}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
