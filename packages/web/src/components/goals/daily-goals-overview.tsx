import { Card, CardContent } from "../ui";

type DailyGoalsOverviewProps = {
  calories: number;
  calorieTarget: number | null;
  protein: number;
  proteinTarget: number | null;
  carbs: number;
  carbTarget: number | null;
  fat: number;
  fatTarget: number | null;
};

function ratio(current: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.min(current / target, 1);
}

function CalorieRing({ consumed, target }: { consumed: number; target: number | null }) {
  const safeTarget = target && target > 0 ? target : 1;
  const progress = Math.min(consumed / safeTarget, 1);
  const circumference = 2 * Math.PI * 72;
  const offset = circumference * (1 - progress);
  const left = Math.max((target ?? 0) - consumed, 0);

  return (
    <div className="relative h-[188px] w-[188px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r="72" stroke="hsl(230 22% 92%)" strokeWidth="12" fill="none" />
        <circle
          cx="90"
          cy="90"
          r="72"
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-black leading-none text-slate-800">{Math.round(left)}</p>
        <p className="mt-2 text-[0.78rem] font-black uppercase tracking-[0.14em] text-slate-400">Kcal Left</p>
      </div>
    </div>
  );
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number | null; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between text-sm font-black leading-none text-slate-700">
        <p className="text-slate-400">{label}</p>
        <p>{Math.round(value)}g</p>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.round(ratio(value, target) * 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function DailyGoalsOverview({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  carbs,
  carbTarget,
  fat,
  fatTarget,
}: DailyGoalsOverviewProps) {
  return (
    <Card className="rounded-[2.3rem] border-slate-100 bg-white p-2">
      <CardContent className="p-3">
        <div className="grid w-full grid-cols-[200px_1fr] items-end gap-6">
          <CalorieRing consumed={calories} target={calorieTarget} />

          <div className="flex h-full flex-col justify-between gap-6">
            <p className="text-[0.82rem] font-black uppercase tracking-[0.14em] text-slate-400">Total Consumed</p>
            <p className="text-6xl font-black leading-none text-slate-800">
              {Math.round(calories)}
              <span className="ml-2 text-4xl text-slate-300">/{calorieTarget ?? "-"}</span>
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <MacroBar label="P" value={protein} target={proteinTarget} color="hsl(348 67% 58%)" />
              <MacroBar label="C" value={carbs} target={carbTarget} color="hsl(36 76% 53%)" />
              <MacroBar label="F" value={fat} target={fatTarget} color="hsl(149 41% 49%)" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
