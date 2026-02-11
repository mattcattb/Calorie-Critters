import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardContent } from "../components/ui";
import { apiFetch } from "../lib/api";
import { useSession } from "../lib/auth";
import type {
  UserProfile,
  EntryWithFood,
  DailySummary,
} from "@calorie-critters/shared";
import { MEAL_TYPES } from "@calorie-critters/shared";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function MacroBar({
  label,
  current,
  target,
  color,
}: {
  label: string;
  current: number;
  target: number | null;
  color: string;
}) {
  const pct = target ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(current)}{target ? ` / ${target}` : ""}
          {label === "Calories" ? " kcal" : "g"}
        </span>
      </div>
      {target ? (
        <div className="h-3 overflow-hidden rounded-full bg-muted/40">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function DashboardPage() {
  const { data: session, isPending } = useSession();
  const today = new Date().toISOString().split("T")[0];

  const canFetch = useMemo(
    () => Boolean(session && !isPending),
    [session, isPending],
  );

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<UserProfile | null>("/api/profile"),
    enabled: canFetch,
  });

  const summaryQuery = useQuery({
    queryKey: ["summary", today],
    queryFn: () => apiFetch<DailySummary>(`/api/entries/summary?date=${today}`),
    enabled: canFetch,
  });

  const entriesQuery = useQuery({
    queryKey: ["entries", today],
    queryFn: () =>
      apiFetch<EntryWithFood[]>(`/api/entries?date=${today}`),
    enabled: canFetch,
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const entries = entriesQuery.data ?? [];

  const entriesByMeal = MEAL_TYPES.map((meal) => ({
    meal,
    items: entries.filter((e) => e.entry.mealType === meal),
  }));

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link to="/log">
          <Button effect="glow">Log Food</Button>
        </Link>
      </section>

      {!profile?.calorieTarget ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Set up your profile to see macro targets.{" "}
              <Link to="/profile" className="text-primary underline">
                Go to profile
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">Today's Macros</h3>
          {summaryQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-3">
              <MacroBar
                label="Calories"
                current={summary?.totalCalories ?? 0}
                target={profile?.calorieTarget ?? null}
                color="bg-primary"
              />
              <MacroBar
                label="Protein"
                current={summary?.totalProtein ?? 0}
                target={profile?.proteinTarget ?? null}
                color="bg-blue-500"
              />
              <MacroBar
                label="Carbs"
                current={summary?.totalCarbs ?? 0}
                target={profile?.carbTarget ?? null}
                color="bg-amber-500"
              />
              <MacroBar
                label="Fat"
                current={summary?.totalFat ?? 0}
                target={profile?.fatTarget ?? null}
                color="bg-rose-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Food Log</h3>
        {entriesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading entries...</p>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              No food logged today.{" "}
              <Link to="/log" className="text-primary underline">
                Log your first meal
              </Link>
            </CardContent>
          </Card>
        ) : (
          entriesByMeal
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.meal} className="space-y-2">
                <h4 className="text-sm font-semibold capitalize text-muted-foreground">
                  {group.meal}
                </h4>
                <div className="grid gap-2">
                  {group.items.map(({ entry, food }) => (
                    <Card key={entry.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.servings} x {food.servingSize}
                            {food.servingUnit}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">
                            {Math.round(food.calories * entry.servings)} kcal
                          </div>
                          <div className="text-xs text-muted-foreground">
                            P {Math.round(food.protein * entry.servings)}g
                            {" / "}C {Math.round(food.carbs * entry.servings)}g
                            {" / "}F {Math.round(food.fat * entry.servings)}g
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
