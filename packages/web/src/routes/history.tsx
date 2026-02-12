import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MEAL_TYPES, type DailySummary, type EntryWithFood } from "@calorie-critters/shared";
import { Card, CardContent, Input } from "../components/ui";
import { HistoryStatChip, MealSection } from "../components/history";
import { PageHeader } from "../components/layout/page-header";
import { apiFetch } from "../lib/api";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

function HistoryPage() {
  const { data: session, isPending } = useSession();
  const [selectedDate, setSelectedDate] = useState(isoToday);

  const canFetch = Boolean(session && !isPending);

  const entriesQuery = useQuery({
    queryKey: ["entries", selectedDate],
    queryFn: () => apiFetch<EntryWithFood[]>(`/api/entries?date=${selectedDate}`),
    enabled: canFetch,
  });

  const summaryQuery = useQuery({
    queryKey: ["summary", selectedDate],
    queryFn: () => apiFetch<DailySummary>(`/api/entries/summary?date=${selectedDate}`),
    enabled: canFetch,
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const entries = entriesQuery.data ?? [];
  const grouped = useMemo(
    () =>
      MEAL_TYPES.map((mealType) => ({
        mealType,
        items: entries.filter(({ entry }) => entry.mealType === mealType),
      })).filter((group) => group.items.length > 0),
    [entries],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Record History"
        subtitle="A clean timeline of your meals"
        action={
          <Input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-11 min-w-[160px] rounded-xl bg-white px-3 py-2 text-sm"
          />
        }
      />

      <Card className="rounded-[2.2rem] p-2">
        <CardContent className="space-y-3 p-3">
          <h2 className="section-title">Daily Totals</h2>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <HistoryStatChip label="Calories" value={`${Math.round(summaryQuery.data?.totalCalories ?? 0)} kcal`} />
            <HistoryStatChip label="Protein" value={`${Math.round(summaryQuery.data?.totalProtein ?? 0)}g`} />
            <HistoryStatChip label="Carbs" value={`${Math.round(summaryQuery.data?.totalCarbs ?? 0)}g`} />
            <HistoryStatChip label="Fats" value={`${Math.round(summaryQuery.data?.totalFat ?? 0)}g`} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.2rem] p-2">
        <CardContent className="space-y-3 p-3">
          <h2 className="section-title">Meal History</h2>

          {entriesQuery.isLoading ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Loading entries...</p>
              <div className="h-18 rounded-[1.4rem] border border-indigo-100 bg-slate-50 animate-pulse" />
              <div className="h-18 rounded-[1.4rem] border border-indigo-100 bg-slate-50 animate-pulse" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-[1.3rem] border border-indigo-100 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">
              No entries for this date.
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map((group) => (
                <MealSection key={group.mealType} mealType={group.mealType} items={group.items} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
