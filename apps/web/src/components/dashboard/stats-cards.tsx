import { Card, CardContent } from "../ui/card";

interface StatsCardsProps {
  todayUnits: number;
  todayNicotine: number;
  todaySpent: number;
  streak: number;
  goalMode: "monitor" | "reduce" | "quit";
  dailyGoal?: number;
}

function TrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function StatsCards({
  todayUnits,
  todayNicotine,
  todaySpent,
  streak,
  goalMode,
  dailyGoal,
}: StatsCardsProps) {
  const goalProgress = dailyGoal
    ? Math.min((todayNicotine / dailyGoal) * 100, 100)
    : 0;
  const isOverGoal = dailyGoal && todayNicotine > dailyGoal;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-foreground">{todayUnits}</p>
              <p className="text-xs text-muted-foreground">units logged</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingDownIcon className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Spent Today</p>
              <p className="text-2xl font-bold text-foreground">
                ${todaySpent.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">on nicotine</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-2">
              <DollarIcon className="h-4 w-4 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {goalMode === "quit" ? "Days Clean" : "Tracking Streak"}
              </p>
              <p className="text-2xl font-bold text-foreground">{streak}</p>
              <p className="text-xs text-muted-foreground">
                {streak === 1 ? "day" : "days"}
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-2">
              <FlameIcon className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <p className="text-xs text-muted-foreground">
                {goalMode === "monitor" ? "Nicotine Today" : "Daily Goal"}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {todayNicotine.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">
                  {dailyGoal ? ` / ${dailyGoal}` : ""} mg
                </span>
              </p>
              {goalMode !== "monitor" && dailyGoal ? (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${goalProgress}%`,
                      backgroundColor: isOverGoal ? "#ef4444" : "#22c997",
                    }}
                  />
                </div>
              ) : null}
            </div>
            {goalMode === "reduce" || goalMode === "quit" ? (
              <div className="rounded-lg bg-primary/10 p-2">
                <TargetIcon className="h-4 w-4 text-primary" />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
