import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ACTIVITY_LEVELS,
  GOALS,
  SEX_OPTIONS,
  UNIT_SYSTEMS,
  calculateAge,
  calculateBMR,
  calculateMacroTargets,
  calculateTDEE,
  convertHeight,
  convertWeight,
  type ActivityLevel,
  type Goal,
  type Sex,
  type UnitSystem,
  type UpsertProfileInput,
  type UserProfile,
} from "@calorie-critters/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "../components/ui";
import { useSession } from "../lib/auth";
import { honoClient } from "../lib/hono.client";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type ProfileFormState = {
  height: string;
  weight: string;
  sex: Sex | "";
  dateOfBirth: string;
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
  calorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
  unitSystem: UnitSystem;
};

type ProfileTab = "basics" | "targets";

const DEFAULT_PROFILE_FORM: ProfileFormState = {
  height: "",
  weight: "",
  sex: "",
  dateOfBirth: "",
  activityLevel: "",
  goal: "",
  calorieTarget: "",
  proteinTarget: "",
  carbTarget: "",
  fatTarget: "",
  unitSystem: "metric",
};

function mapProfileToForm(profile: UserProfile | null): ProfileFormState {
  if (!profile) return DEFAULT_PROFILE_FORM;
  return {
    height: profile.height === null ? "" : String(profile.height),
    weight: profile.weight === null ? "" : String(profile.weight),
    sex: profile.sex ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    activityLevel: profile.activityLevel ?? "",
    goal: profile.goal ?? "",
    calorieTarget: profile.calorieTarget === null ? "" : String(profile.calorieTarget),
    proteinTarget: profile.proteinTarget === null ? "" : String(profile.proteinTarget),
    carbTarget: profile.carbTarget === null ? "" : String(profile.carbTarget),
    fatTarget: profile.fatTarget === null ? "" : String(profile.fatTarget),
    unitSystem: profile.unitSystem,
  };
}

function parseNumberOrNull(value: string, asInteger = false): number | null {
  if (!value.trim()) return null;
  const parsed = asInteger ? Number.parseInt(value, 10) : Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

function tabClass(active: boolean): string {
  return active
    ? "rounded-full border border-primary/25 bg-primary/15 px-4 py-2 text-sm font-semibold text-foreground"
    : "rounded-full border border-border/75 bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-border hover:bg-surface-2 hover:text-foreground";
}

function ProfilePage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ProfileTab>("basics");
  const [form, setForm] = useState<ProfileFormState>(DEFAULT_PROFILE_FORM);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => honoClient.profile.get<UserProfile | null>(),
    enabled: Boolean(session && !isPending),
  });

  useEffect(() => {
    if (profileQuery.data !== undefined) {
      setForm(mapProfileToForm(profileQuery.data));
    }
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: UpsertProfileInput) =>
      honoClient.profile.update<UserProfile>(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      notify({
        type: "success",
        title: "Profile saved",
        description: "Your onboarding and goal settings were updated.",
      });
    },
    onError: (error) => {
      notify({ type: "error", title: "Save failed", description: getErrorMessage(error) });
    },
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const handleAutoCalculate = () => {
    if (!form.height || !form.weight || !form.sex || !form.dateOfBirth || !form.activityLevel || !form.goal) {
      notify({
        type: "error",
        title: "Missing fields",
        description: "Height, weight, sex, DOB, activity level, and goal are required.",
      });
      return;
    }

    const heightInput = parseNumberOrNull(form.height);
    const weightInput = parseNumberOrNull(form.weight);
    if (heightInput === null || heightInput <= 0 || weightInput === null || weightInput <= 0) {
      notify({
        type: "error",
        title: "Invalid measurements",
        description: "Height and weight must be valid positive numbers.",
      });
      return;
    }

    const age = calculateAge(form.dateOfBirth);
    if (age <= 0) {
      notify({ type: "error", title: "Invalid date of birth", description: "Please enter a valid date of birth." });
      return;
    }

    const weightKg =
      form.unitSystem === "imperial" ? convertWeight(weightInput, "imperial", "metric") : weightInput;
    const heightCm =
      form.unitSystem === "imperial" ? convertHeight(heightInput, "imperial", "metric") : heightInput;

    const bmr = calculateBMR(weightKg, heightCm, age, form.sex);
    const tdee = calculateTDEE(bmr, form.activityLevel);
    const targets = calculateMacroTargets(tdee, form.goal);

    setForm((prev) => ({
      ...prev,
      calorieTarget: String(targets.calories),
      proteinTarget: String(targets.protein),
      carbTarget: String(targets.carbs),
      fatTarget: String(targets.fat),
    }));

    notify({ type: "success", title: "Targets calculated", description: "Targets were updated from profile data." });
    setActiveTab("targets");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: UpsertProfileInput = {
      height: parseNumberOrNull(form.height),
      weight: parseNumberOrNull(form.weight),
      sex: form.sex || null,
      dateOfBirth: form.dateOfBirth || null,
      activityLevel: form.activityLevel || null,
      goal: form.goal || null,
      calorieTarget: parseNumberOrNull(form.calorieTarget, true),
      proteinTarget: parseNumberOrNull(form.proteinTarget, true),
      carbTarget: parseNumberOrNull(form.carbTarget, true),
      fatTarget: parseNumberOrNull(form.fatTarget, true),
      unitSystem: form.unitSystem,
    };

    saveMutation.mutate(payload);
  };

  const heightLabel = form.unitSystem === "metric" ? "Height (cm)" : "Height (inches)";
  const weightLabel = form.unitSystem === "metric" ? "Weight (kg)" : "Weight (lbs)";

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="page-title">Profile & Goals</h2>
        <p className="text-sm text-muted-foreground">Configure essentials once, then tweak targets as needed.</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass(activeTab === "basics")} onClick={() => setActiveTab("basics")}>
            Basics
          </button>
          <button type="button" className={tabClass(activeTab === "targets")} onClick={() => setActiveTab("targets")}>
            Targets
          </button>
        </div>

        <Card>
          <CardContent className="space-y-4 p-2">
            {profileQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge>{form.unitSystem === "metric" ? "Metric" : "Imperial"}</Badge>
                  {form.goal ? <Badge variant="primary">Goal: {formatEnumLabel(form.goal)}</Badge> : null}
                </div>

                {activeTab === "basics" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="field-grid">
                      <Label htmlFor="unitSystem">Unit System</Label>
                      <Select
                        value={form.unitSystem}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, unitSystem: value as UnitSystem }))}
                      >
                        <SelectTrigger id="unitSystem">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_SYSTEMS.map((unit) => (
                            <SelectItem key={unit} value={unit}>{formatEnumLabel(unit)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
                      />
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="height">{heightLabel}</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.height}
                        onChange={(event) => setForm((prev) => ({ ...prev, height: event.target.value }))}
                        placeholder={form.unitSystem === "metric" ? "175" : "69"}
                      />
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="weight">{weightLabel}</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.weight}
                        onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                        placeholder={form.unitSystem === "metric" ? "72.5" : "160"}
                      />
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="sex">Sex</Label>
                      <Select
                        value={form.sex}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, sex: value as Sex | "" }))}
                      >
                        <SelectTrigger id="sex">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEX_OPTIONS.map((sex) => (
                            <SelectItem key={sex} value={sex}>{formatEnumLabel(sex)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="activityLevel">Activity Level</Label>
                      <Select
                        value={form.activityLevel}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, activityLevel: value as ActivityLevel | "" }))
                        }
                      >
                        <SelectTrigger id="activityLevel">
                          <SelectValue placeholder="Select activity" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_LEVELS.map((activity) => (
                            <SelectItem key={activity} value={activity}>{formatEnumLabel(activity)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="field-grid sm:col-span-2">
                      <Label htmlFor="goal">Goal</Label>
                      <Select
                        value={form.goal}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, goal: value as Goal | "" }))}
                      >
                        <SelectTrigger id="goal">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {GOALS.map((goal) => (
                            <SelectItem key={goal} value={goal}>{formatEnumLabel(goal)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2">
                      <Button type="button" variant="secondary" onClick={handleAutoCalculate}>
                        Calculate Targets
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="field-grid">
                      <Label htmlFor="calories">Calorie Target (kcal)</Label>
                      <Input
                        id="calories"
                        type="number"
                        min="0"
                        step="1"
                        value={form.calorieTarget}
                        onChange={(event) => setForm((prev) => ({ ...prev, calorieTarget: event.target.value }))}
                      />
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="protein">Protein Target (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        min="0"
                        step="1"
                        value={form.proteinTarget}
                        onChange={(event) => setForm((prev) => ({ ...prev, proteinTarget: event.target.value }))}
                      />
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="carbs">Carb Target (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        min="0"
                        step="1"
                        value={form.carbTarget}
                        onChange={(event) => setForm((prev) => ({ ...prev, carbTarget: event.target.value }))}
                      />
                    </div>

                    <div className="field-grid">
                      <Label htmlFor="fat">Fat Target (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        min="0"
                        step="1"
                        value={form.fatTarget}
                        onChange={(event) => setForm((prev) => ({ ...prev, fatTarget: event.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" effect="glow" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
          {activeTab === "basics" ? (
            <Button type="button" variant="outline" onClick={() => setActiveTab("targets")}>
              Go to Targets
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setActiveTab("basics")}>
              Back to Basics
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
