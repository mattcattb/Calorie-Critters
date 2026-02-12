import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DailySummary, UserProfile } from "@calorie-critters/shared";
import { AppIcon, Button, Card, CardContent } from "../components/ui";
import { honoClient } from "../lib/hono.client";
import { useSession } from "../lib/auth";
import { PetAvatar, usePet } from "../pet";
import { useLogFoodModal } from "../log/log-food-modal-context";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function ratio(current: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.min(current / target, 1);
}

function Ring({ consumed, goal }: { consumed: number; goal: number | null }) {
  const safeGoal = goal && goal > 0 ? goal : 1;
  const progress = Math.min(consumed / safeGoal, 1);
  const circumference = 2 * Math.PI * 64;
  const offset = circumference * (1 - progress);
  const left = Math.max((goal ?? 0) - consumed, 0);

  return (
    <div className="relative h-[172px] w-[172px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r="64" stroke="hsl(230 22% 92%)" strokeWidth="10" fill="none" />
        <circle
          cx="80"
          cy="80"
          r="64"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-black leading-none text-slate-800">{Math.round(left)}</p>
        <p className="mt-2 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-400">Kcal Left</p>
      </div>
    </div>
  );
}

function MacroRow({
  label,
  value,
  target,
  barColor,
}: {
  label: string;
  value: number;
  target: number | null;
  barColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between text-sm font-black leading-none text-slate-700">
        <p className="text-slate-400">{label}</p>
        <p>{Math.round(value)}g</p>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(ratio(value, target) * 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { openLog } = useLogFoodModal();
  const { petBundle, isLoading: isPetLoading } = usePet();
  const today = new Date().toISOString().split("T")[0];

  const canFetch = useMemo(() => Boolean(session && !isPending), [session, isPending]);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => honoClient.profile.get<UserProfile | null>(),
    enabled: canFetch,
  });

  const summaryQuery = useQuery({
    queryKey: ["summary", today],
    queryFn: () => honoClient.entries.summary<DailySummary>(today),
    enabled: canFetch,
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const summary = summaryQuery.data;
  const profile = profileQuery.data;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(130deg,hsl(245_79%_62%),hsl(266_84%_61%))] px-5 py-7 text-white shadow-sticker">
        <div className="relative z-10 max-w-[290px] space-y-4">
          <h1 className="text-4xl font-black leading-[0.95]">
            {petBundle ? `${petBundle.pet.name} is feeling` : "Your buddy is feeling"}
            <br />
            amazing!
          </h1>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={openLog}
              className="border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-300 hover:bg-indigo-600/95"
              variant="primary"
            >
              <AppIcon size="md" className="h-5 w-5">
                <path d="M12 5.5V18.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M5.5 12H18.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              </AppIcon>
              Log Food
            </Button>
            <Link to="/history">
              <Button variant="secondary" className="border-white/25 bg-white/12 text-white hover:bg-white/18">
                View Logs
              </Button>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-1 right-1 opacity-95">
          {isPetLoading || !petBundle ? (
            <div className="h-32 w-32 rounded-[34px] bg-white/20" />
          ) : (
            <PetAvatar
              template={petBundle.template}
              mood={petBundle.snapshot.mood}
              animation={petBundle.snapshot.animation}
              className="h-32 w-32"
            />
          )}
        </div>
      </section>

      <Card className="rounded-[2.2rem] border-slate-100 bg-white p-2">
        <CardContent className="space-y-5 p-3">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <Ring consumed={Math.round(summary?.totalCalories ?? 0)} goal={profile?.calorieTarget ?? null} />

            <div className="w-full space-y-1 text-center sm:text-left">
              <p className="text-[0.78rem] font-black uppercase tracking-[0.14em] text-slate-400">Total Consumed</p>
              <p className="text-6xl font-black leading-none text-slate-800">
                {Math.round(summary?.totalCalories ?? 0)}
                <span className="ml-2 text-4xl text-slate-300">/{profile?.calorieTarget ?? "-"}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MacroRow
              label="P"
              value={summary?.totalProtein ?? 0}
              target={profile?.proteinTarget ?? null}
              barColor="hsl(348 67% 58%)"
            />
            <MacroRow
              label="C"
              value={summary?.totalCarbs ?? 0}
              target={profile?.carbTarget ?? null}
              barColor="hsl(36 76% 53%)"
            />
            <MacroRow
              label="F"
              value={summary?.totalFat ?? 0}
              target={profile?.fatTarget ?? null}
              barColor="hsl(149 41% 49%)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
