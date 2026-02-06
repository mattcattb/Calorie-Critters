import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SEXES, WEIGHT_UNITS, type Sex, type WeightUnit } from "@nicflow/shared";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { useOnboardingProfile } from "../lib/onboarding";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  useToast,
} from "../components/ui";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isPending: profilePending } = useOnboardingProfile(
    Boolean(session)
  );

  const [sex, setSex] = useState<Sex>("prefer_not_to_say");
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lb");
  const [error, setError] = useState("");

  const formatSexLabel = (value: string) =>
    value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    if (!profile) return;
    if (profile.sex) setSex(profile.sex);
    if (profile.weight) setWeight(String(profile.weight));
    if (profile.weightUnit) setWeightUnit(profile.weightUnit);
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      setError("");
      const weightValue = Number(weight);
      const res = await api.onboarding.$put({
        json: {
          sex,
          weight: Number.isFinite(weightValue) ? weightValue : undefined,
          weightUnit,
          onboardingCompleted: true,
        },
      });
      if (!res.ok) {
        const errorBody = (await res.json()) as { error?: { message?: string } };
        throw new Error(errorBody.error?.message ?? "Unable to save profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingProfile"] });
      notify({
        title: "Profile saved",
        description: "Your nicotine estimates are now personalized.",
        type: "success",
      });
      navigate({ to: "/" });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Please try again.");
    },
  });

  if (isPending || (session && profilePending)) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto mt-16 w-full max-w-md px-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <p className="text-sm text-muted-foreground">
              Please sign in to complete onboarding.
            </p>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="inline-flex">
              <Button className="w-full">Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-lg px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Quick onboarding</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Add a couple details so we can personalize your nicotine level
            estimates.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile.mutate();
            }}
            className="space-y-4"
          >
            {error ? (
              <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            ) : null}
            <div className="field-grid">
              <Label htmlFor="sex">Sex</Label>
              <Select
                id="sex"
                value={sex}
                onChange={(event) => setSex(event.target.value as Sex)}
              >
                {SEXES.map((value) => (
                  <option key={value} value={value}>
                    {formatSexLabel(value)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
              <div className="field-grid">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="650"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="e.g. 165"
                  required
                />
              </div>
              <div className="field-grid">
                <Label htmlFor="weight-unit">Unit</Label>
                <Select
                  id="weight-unit"
                  value={weightUnit}
                  onChange={(event) =>
                    setWeightUnit(event.target.value as WeightUnit)
                  }
                >
                  {WEIGHT_UNITS.map((value) => (
                    <option key={value} value={value}>
                      {value.toUpperCase()}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!weight || saveProfile.isPending}
              effect="glow"
            >
              {saveProfile.isPending ? "Saving..." : "Save and continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
