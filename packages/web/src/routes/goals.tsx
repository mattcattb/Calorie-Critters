import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateAge,
  calculateBMR,
  calculateMacroTargets,
  calculateTDEE,
  convertHeight,
  convertWeight,
  type DailySummary,
  type UpsertProfileInput,
  type UserProfile,
} from "@calorie-critters/shared";
import { AppIcon, Button, Card, CardContent, Input, useToast } from "../components/ui";
import { DailyGoalsOverview } from "../components/goals";
import { honoClient } from "../lib/hono.client";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
});

type GoalForm = {
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
};

function mapProfileToForm(profile: UserProfile | null): GoalForm {
  return {
    calorieTarget: profile?.calorieTarget ?? 2200,
    proteinTarget: profile?.proteinTarget ?? 150,
    carbTarget: profile?.carbTarget ?? 250,
    fatTarget: profile?.fatTarget ?? 70,
  };
}

function toUpsertInput(profile: UserProfile, form: GoalForm): UpsertProfileInput {
  return {
    height: profile.height,
    weight: profile.weight,
    sex: profile.sex,
    dateOfBirth: profile.dateOfBirth,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    unitSystem: profile.unitSystem,
    calorieTarget: form.calorieTarget,
    proteinTarget: form.proteinTarget,
    carbTarget: form.carbTarget,
    fatTarget: form.fatTarget,
  };
}

function GoalsPage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<GoalForm>({
    calorieTarget: 2200,
    proteinTarget: 150,
    carbTarget: 250,
    fatTarget: 70,
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => honoClient.profile.get<UserProfile | null>(),
    enabled: Boolean(session && !isPending),
  });

  const today = new Date().toISOString().split("T")[0];
  const summaryQuery = useQuery({
    queryKey: ["summary", today],
    queryFn: () => honoClient.entries.summary<DailySummary>(today),
    enabled: Boolean(session && !isPending),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setForm(mapProfileToForm(profileQuery.data));
    }
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: UpsertProfileInput) =>
      honoClient.profile.update<UserProfile>(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      notify({ type: "success", title: "Saved", description: "Goal targets updated." });
    },
    onError: (error) => {
      notify({
        type: "error",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    },
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const profile = profileQuery.data;
  const summary = summaryQuery.data;

  const saveTargets = () => {
    if (!profile) return;
    saveMutation.mutate(toUpsertInput(profile, form));
  };

  const applyRecommended = () => {
    if (!profile?.height || !profile?.weight || !profile?.sex || !profile?.dateOfBirth || !profile?.activityLevel || !profile?.goal) {
      notify({
        type: "error",
        title: "Missing profile info",
        description: "Set height, weight, sex, DOB, activity, and goal in Settings/Profile first.",
      });
      return;
    }

    const age = calculateAge(profile.dateOfBirth);
    if (age <= 0) {
      notify({ type: "error", title: "Invalid DOB", description: "Please update your date of birth." });
      return;
    }

    const weightKg = profile.unitSystem === "imperial" ? convertWeight(profile.weight, "imperial", "metric") : profile.weight;
    const heightCm = profile.unitSystem === "imperial" ? convertHeight(profile.height, "imperial", "metric") : profile.height;

    const bmr = calculateBMR(weightKg, heightCm, age, profile.sex);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const targets = calculateMacroTargets(tdee, profile.goal);

    setForm({
      calorieTarget: targets.calories,
      proteinTarget: targets.protein,
      carbTarget: targets.carbs,
      fatTarget: targets.fat,
    });
  };

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h1 className="page-title">Goals</h1>
        <p className="text-sm font-semibold text-muted-foreground">Set your daily targets.</p>
      </section>

      <DailyGoalsOverview
        calories={summary?.totalCalories ?? 0}
        calorieTarget={profile?.calorieTarget ?? null}
        protein={summary?.totalProtein ?? 0}
        proteinTarget={profile?.proteinTarget ?? null}
        carbs={summary?.totalCarbs ?? 0}
        carbTarget={profile?.carbTarget ?? null}
        fat={summary?.totalFat ?? 0}
        fatTarget={profile?.fatTarget ?? null}
      />

      <Card className="rounded-[2.4rem] p-3">
        <CardContent className="space-y-8 p-3">
          <div className="grid gap-3 rounded-[2rem] bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="sm:col-span-2">
              <p className="text-base font-black text-slate-800">Current Stats</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.8rem] font-black uppercase tracking-[0.12em] text-slate-400">Weight</p>
                <p className="text-3xl font-black text-slate-800">{profile?.weight ?? "-"}{profile?.unitSystem === "imperial" ? "lb" : "kg"}</p>
              </div>
              <div>
                <p className="text-[0.8rem] font-black uppercase tracking-[0.12em] text-slate-400">Height</p>
                <p className="text-3xl font-black text-slate-800">{profile?.height ?? "-"}{profile?.unitSystem === "imperial" ? "in" : "cm"}</p>
              </div>
            </div>

            <Button className="h-14 rounded-[1.2rem] px-6 text-lg" onClick={applyRecommended}>
              <AppIcon size="md" className="h-6 w-6">
                <path d="M12 3.8L13.7 8.1L18.2 9.8L13.7 11.5L12 15.8L10.3 11.5L5.8 9.8L10.3 8.1L12 3.8Z" fill="currentColor" />
              </AppIcon>
              Get Recommended
            </Button>
          </div>

          <div className="space-y-4 border-b border-slate-100 pb-8">
            <p className="text-lg font-black uppercase tracking-[0.12em] text-slate-400">Target Calories</p>
            <div className="flex items-center gap-5">
              <input
                type="range"
                min={1200}
                max={4000}
                step={50}
                value={form.calorieTarget}
                onChange={(event) => setForm((prev) => ({ ...prev, calorieTarget: Number(event.target.value) }))}
                className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
              />
              <p className="min-w-[120px] text-right text-5xl font-black text-indigo-600">{form.calorieTarget}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { key: "proteinTarget", label: "Protein (g)", dot: "bg-rose-500" },
              { key: "carbTarget", label: "Carbs (g)", dot: "bg-amber-500" },
              { key: "fatTarget", label: "Fats (g)", dot: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <p className="text-[0.82rem] font-black uppercase tracking-[0.1em] text-slate-400">{item.label}</p>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={form[item.key as keyof GoalForm]}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        [item.key]: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                    className="h-16 rounded-[1.2rem] bg-slate-50 px-5 text-4xl font-black"
                  />
                  <span className={`absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full ${item.dot}`} />
                </div>
              </div>
            ))}
          </div>

          <Button className="h-14 w-full rounded-[1.5rem] text-lg" onClick={saveTargets} disabled={saveMutation.isPending || !profile}>
            {saveMutation.isPending ? "Saving..." : "Save Goals"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
