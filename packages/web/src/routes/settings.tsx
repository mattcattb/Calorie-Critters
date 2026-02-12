import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UnitSystem, UpsertProfileInput, UserProfile } from "@calorie-critters/shared";
import { Button, Card, CardContent, Input, Label, Select, useToast } from "../components/ui";
import { apiFetch } from "../lib/api";
import { signOut, useSession } from "../lib/auth";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function toUpsertInput(profile: UserProfile): UpsertProfileInput {
  return {
    height: profile.height,
    weight: profile.weight,
    sex: profile.sex,
    dateOfBirth: profile.dateOfBirth,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    calorieTarget: profile.calorieTarget,
    proteinTarget: profile.proteinTarget,
    carbTarget: profile.carbTarget,
    fatTarget: profile.fatTarget,
    unitSystem: profile.unitSystem,
  };
}

function SettingsPage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<UserProfile | null>("/api/profile"),
    enabled: Boolean(session && !isPending),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: UpsertProfileInput) =>
      apiFetch<UserProfile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      notify({ type: "success", title: "Saved", description: "Settings updated." });
    },
    onError: (error) => {
      notify({ type: "error", title: "Save failed", description: error instanceof Error ? error.message : "Try again." });
    },
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-4">
      <section className="space-y-1">
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-muted-foreground">Only the essentials.</p>
      </section>

      <Card>
        <CardContent className="space-y-3 p-2">
          <h2 className="section-title">Daily Targets</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field-grid">
              <Label htmlFor="calorieTarget">Calories</Label>
              <Input
                id="calorieTarget"
                type="number"
                defaultValue={profile?.calorieTarget ?? ""}
                onBlur={(event) => {
                  const next = Number.parseInt(event.target.value || "0", 10);
                  if (!Number.isFinite(next) || next <= 0 || !profile) return;
                  saveMutation.mutate({ ...toUpsertInput(profile), calorieTarget: next });
                }}
              />
            </div>
            <div className="field-grid">
              <Label htmlFor="unitSystem">Unit System</Label>
              <Select
                id="unitSystem"
                defaultValue={profile?.unitSystem ?? "metric"}
                onChange={(event) => {
                  if (!profile) return;
                  saveMutation.mutate({ ...toUpsertInput(profile), unitSystem: event.target.value as UnitSystem });
                }}
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </Select>
            </div>
          </div>

          <Link to="/profile" className="inline-block">
            <Button size="sm" variant="outline">Advanced Profile</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-2">
          <h2 className="section-title">Account</h2>
          <Button variant="danger" onClick={() => signOut()}>Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
