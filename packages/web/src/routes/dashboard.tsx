import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type {
  DailySummary,
  EntryWithFood,
  UserProfile,
} from "@calorie-critters/shared";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { Button, Card, CardContent } from "../components/ui";
import { MealEntryCard } from "../components/history";
import { honoClient } from "../lib/hono.client";
import { useSession } from "../lib/auth";
import { localDateKey } from "../lib/date";
import { PetAvatar, usePet } from "../pet";
import { useLogFoodModal } from "../log/log-food-modal-context";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function progressRatio(current: number, target: number | null): number {
  if (!target || target <= 0) return 0;
  return Math.min(current / target, 1);
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function getDailyMessage(calories: number, goal: number | null) {
  if (calories <= 0) {
    return {
      eyebrow: "Fresh day",
      title: "Ready when you are",
      body: "Log your first meal and your critter will keep pace with you.",
    };
  }

  const progress = goal && goal > 0 ? calories / goal : 0;
  if (progress < 0.5) {
    return {
      eyebrow: "Nice start",
      title: "Keep the rhythm going",
      body: "A few quick check-ins are all it takes to see the full day.",
    };
  }
  if (progress <= 1.05) {
    return {
      eyebrow: "On track",
      title: "You’re pacing the day well",
      body: "Your meals and macros are coming together.",
    };
  }
  return {
    eyebrow: "Day captured",
    title: "The honest log still counts",
    body: "No judgment—use today’s record to make tomorrow easier.",
  };
}

function CalorieRing({
  consumed,
  goal,
}: {
  consumed: number;
  goal: number | null;
}) {
  const circumference = 2 * Math.PI * 64;
  const progress = progressRatio(consumed, goal);
  const offset = circumference * (1 - progress);
  const remaining = (goal ?? 0) - consumed;
  const isOver = Boolean(goal && remaining < 0);
  const centerValue = goal
    ? `${formatAmount(Math.abs(remaining))}`
    : `${formatAmount(consumed)}`;
  const centerLabel = !goal ? "consumed" : isOver ? "over goal" : "kcal left";

  return (
    <div
      className="relative h-[176px] w-[176px] shrink-0"
      role="img"
      aria-label={
        goal
          ? `${formatAmount(consumed)} of ${formatAmount(goal)} calories`
          : `${formatAmount(consumed)} calories consumed`
      }
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r="64" stroke="hsl(230 22% 92%)" strokeWidth="10" fill="none" />
        <circle
          cx="80"
          cy="80"
          r="64"
          stroke={isOver ? "hsl(8 73% 58%)" : "hsl(var(--primary))"}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-black leading-none text-slate-800">{centerValue}</p>
        <p className={`mt-2 text-[0.7rem] font-black uppercase tracking-[0.14em] ${isOver ? "text-rose-500" : "text-slate-400"}`}>
          {centerLabel}
        </p>
      </div>
    </div>
  );
}

function MacroProgress({
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
  const remaining = target ? target - value : null;

  return (
    <div className="rounded-[1.3rem] border border-indigo-100 bg-slate-50/80 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.13em] text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-black leading-none text-slate-800">
            {formatAmount(value)}
            <span className="ml-1 text-xs text-slate-400">g</span>
          </p>
        </div>
        <p className="text-right text-[0.7rem] font-bold leading-tight text-slate-400">
          {remaining === null
            ? "No target"
            : remaining >= 0
              ? `${formatAmount(remaining)}g left`
              : `${formatAmount(Math.abs(remaining))}g over`}
        </p>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={target ?? undefined}
        aria-valuenow={Math.round(value)}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.round(progressRatio(value, target) * 100)}%`,
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
  const today = localDateKey();
  const canFetch = Boolean(session && !isPending);

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

  const entriesQuery = useQuery({
    queryKey: ["entries", today],
    queryFn: () => honoClient.entries.list<EntryWithFood[]>({ date: today }),
    enabled: canFetch,
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const entries = entriesQuery.data ?? [];
  const totalCalories = summary?.totalCalories ?? 0;
  const dailyMessage = getDailyMessage(totalCalories, profile?.calorieTarget ?? null);
  const formattedToday = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(130deg,hsl(245_79%_58%),hsl(267_83%_61%))] px-5 py-6 text-white shadow-sticker sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-300/10" />

        <div className="relative z-10 flex min-h-40 items-center justify-between gap-3">
          <div className="max-w-[31rem] space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-black uppercase tracking-[0.14em] text-white/75">
              <span>{dailyMessage.eyebrow}</span>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formattedToday}
              </span>
            </div>
            <h1 className="max-w-[26rem] text-4xl font-black leading-[0.96] sm:text-5xl">
              {dailyMessage.title}
            </h1>
            <p className="max-w-[25rem] text-sm font-semibold leading-relaxed text-white/80">
              {dailyMessage.body}
            </p>
            <Button
              onClick={openLog}
              className="border-white bg-white text-indigo-700 shadow-lg shadow-indigo-950/15 hover:bg-indigo-50"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Log food
            </Button>
          </div>

          <div className="pointer-events-none hidden shrink-0 sm:block">
            {isPetLoading || !petBundle ? (
              <div className="h-36 w-36 animate-pulse rounded-[2rem] bg-white/15" />
            ) : (
              <div className="relative">
                <PetAvatar
                  template={petBundle.template}
                  mood={petBundle.snapshot.mood}
                  animation={petBundle.snapshot.animation}
                  className="h-40 w-40 drop-shadow-xl"
                />
                <p className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/25 bg-indigo-950/30 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-white/85 backdrop-blur">
                  {petBundle.pet.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[2.2rem] border-indigo-100 bg-white p-2">
          <CardContent className="space-y-5 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-500">Today’s fuel</p>
                <h2 className="mt-1 text-2xl font-black text-slate-800">Daily progress</h2>
              </div>
              <Link to="/goals" className="text-sm font-black text-indigo-600 hover:text-indigo-800">
                Edit goals
              </Link>
            </div>

            {summaryQuery.isLoading || profileQuery.isLoading ? (
              <div className="h-44 animate-pulse rounded-[1.8rem] bg-slate-100" />
            ) : summaryQuery.isError || profileQuery.isError ? (
              <div className="rounded-[1.3rem] border border-rose-100 bg-rose-50 px-4 py-5 text-sm font-semibold text-rose-700">
                Daily progress could not be loaded. Refresh to try again.
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <CalorieRing
                    consumed={totalCalories}
                    goal={profile?.calorieTarget ?? null}
                  />
                  <div className="w-full text-center sm:text-left">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Calories consumed
                    </p>
                    <p className="mt-1 text-5xl font-black leading-none text-slate-800">
                      {formatAmount(totalCalories)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      {profile?.calorieTarget
                        ? `of ${formatAmount(profile.calorieTarget)} kcal`
                        : "Set a calorie target to see pacing"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <MacroProgress
                    label="Protein"
                    value={summary?.totalProtein ?? 0}
                    target={profile?.proteinTarget ?? null}
                    barColor="hsl(348 67% 58%)"
                  />
                  <MacroProgress
                    label="Carbs"
                    value={summary?.totalCarbs ?? 0}
                    target={profile?.carbTarget ?? null}
                    barColor="hsl(36 76% 53%)"
                  />
                  <MacroProgress
                    label="Fat"
                    value={summary?.totalFat ?? 0}
                    target={profile?.fatTarget ?? null}
                    barColor="hsl(149 41% 49%)"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2.2rem] border-indigo-100 bg-white p-2">
          <CardContent className="space-y-4 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-500">Your log</p>
                <h2 className="mt-1 text-2xl font-black text-slate-800">Today’s meals</h2>
              </div>
              <Link
                to="/history"
                className="inline-flex items-center gap-1 text-sm font-black text-indigo-600 hover:text-indigo-800"
              >
                History
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {entriesQuery.isLoading ? (
              <div className="space-y-2">
                <div className="h-16 animate-pulse rounded-[1.3rem] bg-slate-100" />
                <div className="h-16 animate-pulse rounded-[1.3rem] bg-slate-100" />
              </div>
            ) : entriesQuery.isError ? (
              <div className="rounded-[1.3rem] border border-rose-100 bg-rose-50 px-4 py-5 text-sm font-semibold text-rose-700">
                Today’s meals could not be loaded.
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-indigo-200 bg-indigo-50/55 px-5 py-8 text-center">
                <p className="text-lg font-black text-slate-800">Nothing logged yet</p>
                <p className="mx-auto mt-1 max-w-[18rem] text-sm font-semibold leading-relaxed text-slate-500">
                  Search your foods or Open Food Facts and add the first meal in a few taps.
                </p>
                <Button className="mt-4" size="sm" onClick={openLog}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add first food
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {entries.slice(0, 4).map((item) => (
                    <MealEntryCard key={item.entry.id} item={item} />
                  ))}
                </div>
                {entries.length > 4 ? (
                  <Link to="/history" className="block">
                    <Button variant="outline" className="w-full">
                      View all {entries.length} entries
                    </Button>
                  </Link>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
