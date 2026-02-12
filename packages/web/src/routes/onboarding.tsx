import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateAge,
  calculateBMR,
  calculateMacroTargets,
  calculateTDEE,
  convertHeight,
  convertWeight,
  type UpsertProfileInput,
  type UserProfile,
} from "@calorie-critters/shared";
import { Badge, Button, Card, CardContent, useToast } from "../components/ui";
import { useSession } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { isProfileOnboardingComplete } from "../lib/onboarding";
import {
  BasicsStep,
  DEFAULT_PROFILE_FORM,
  LifestyleStep,
  StepProgress,
  TargetsStep,
  isOnboardingPayloadComplete,
  mapProfileToForm,
  parseNumberOrNull,
  toProfilePayload,
  type ProfileFormState,
} from "../components/onboarding";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const STEP_LABELS = ["Basics", "Lifestyle", "Targets"];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

function validateStep(step: number, form: ProfileFormState): string | null {
  if (step === 0) {
    if (!form.dateOfBirth || !form.height || !form.weight) {
      return "Please add date of birth, height, and weight.";
    }
    const height = parseNumberOrNull(form.height);
    const weight = parseNumberOrNull(form.weight);
    if (height === null || height <= 0 || weight === null || weight <= 0) {
      return "Height and weight must be valid positive numbers.";
    }
    return null;
  }

  if (step === 1) {
    if (!form.sex || !form.activityLevel || !form.goal) {
      return "Please select sex, activity level, and goal.";
    }
    return null;
  }

  if (step === 2) {
    const payload = toProfilePayload(form);
    if (!isOnboardingPayloadComplete(payload)) {
      return "Please fill all target fields with valid values.";
    }
  }

  return null;
}

function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<ProfileFormState>(DEFAULT_PROFILE_FORM);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<UserProfile | null>("/api/profile"),
    enabled: Boolean(session && !isPending),
  });

  useEffect(() => {
    if (profileQuery.data !== undefined) {
      const mapped = mapProfileToForm(profileQuery.data);
      if (profileQuery.data?.unitSystem === "metric") {
        mapped.height = mapped.height
          ? String(Math.round(convertHeight(Number(mapped.height), "metric", "imperial") * 10) / 10)
          : "";
        mapped.weight = mapped.weight
          ? String(Math.round(convertWeight(Number(mapped.weight), "metric", "imperial") * 10) / 10)
          : "";
      }
      mapped.unitSystem = "imperial";
      setForm(mapped);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (isProfileOnboardingComplete(profileQuery.data)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [navigate, profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: UpsertProfileInput) =>
      apiFetch<UserProfile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      notify({ type: "success", title: "Onboarding complete", description: "Your profile is ready." });
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error) => {
      notify({ type: "error", title: "Save failed", description: getErrorMessage(error) });
    },
  });

  const canGoBack = currentStep > 0;
  const isFinalStep = currentStep === STEP_LABELS.length - 1;
  const stepValidationError = useMemo(() => validateStep(currentStep, form), [currentStep, form]);

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const patchForm = (patch: Partial<ProfileFormState>) => {
    setForm((prev) => ({ ...prev, ...patch, unitSystem: "imperial" }));
  };

  const handleAutoCalculate = () => {
    if (!form.height || !form.weight || !form.sex || !form.dateOfBirth || !form.activityLevel || !form.goal) {
      notify({
        type: "error",
        title: "Missing fields",
        description: "Fill basics and lifestyle first to auto-calculate targets.",
      });
      return;
    }

    const heightInput = parseNumberOrNull(form.height);
    const weightInput = parseNumberOrNull(form.weight);
    if (heightInput === null || heightInput <= 0 || weightInput === null || weightInput <= 0) {
      notify({ type: "error", title: "Invalid measurements", description: "Height and weight must be positive." });
      return;
    }

    const age = calculateAge(form.dateOfBirth);
    if (age <= 0) {
      notify({ type: "error", title: "Invalid date of birth", description: "Please enter a valid date of birth." });
      return;
    }

    const weightKg = convertWeight(weightInput, "imperial", "metric");
    const heightCm = convertHeight(heightInput, "imperial", "metric");

    const bmr = calculateBMR(weightKg, heightCm, age, form.sex);
    const tdee = calculateTDEE(bmr, form.activityLevel);
    const targets = calculateMacroTargets(tdee, form.goal);

    patchForm({
      calorieTarget: String(targets.calories),
      proteinTarget: String(targets.protein),
      carbTarget: String(targets.carbs),
      fatTarget: String(targets.fat),
    });

    notify({ type: "success", title: "Targets calculated", description: "Targets were filled in for you." });
  };

  const goNextStep = () => {
    const error = validateStep(currentStep, form);
    if (error) {
      notify({ type: "error", title: "Complete this step", description: error });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1));
  };

  const goPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    const payload = toProfilePayload(form);
    if (!isOnboardingPayloadComplete(payload)) {
      notify({ type: "error", title: "Finish onboarding", description: "Please complete all required fields." });
      return;
    }
    saveMutation.mutate(payload);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="space-y-2">
        <h2 className="page-title">Setup Your Critter</h2>
        <p className="text-sm text-muted-foreground">Simple setup. Using inches and pounds only.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-2">
            <StepProgress steps={STEP_LABELS} currentStep={currentStep} />

            {profileQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : (
              <>
                {currentStep === 0 ? <BasicsStep form={form} onChange={patchForm} /> : null}
                {currentStep === 1 ? <LifestyleStep form={form} onChange={patchForm} /> : null}
                {currentStep === 2 ? (
                  <TargetsStep form={form} onChange={patchForm} onAutoCalculate={handleAutoCalculate} />
                ) : null}

                {stepValidationError ? <p className="text-sm text-muted-foreground">{stepValidationError}</p> : null}

                <div className="flex flex-wrap gap-2">
                  {canGoBack ? (
                    <Button type="button" variant="outline" onClick={goPreviousStep}>
                      Back
                    </Button>
                  ) : null}

                  {!isFinalStep ? (
                    <Button type="button" effect="glow" onClick={goNextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="button" effect="glow" onClick={handleFinish} disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Saving..." : "Finish Onboarding"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-2">
            <h3 className="section-title">Quick Summary</h3>
            <div className="space-y-2">
              <div className="rounded-[var(--radius-sm)] border border-border/75 bg-surface-2 px-3 py-2 text-sm text-muted-foreground">
                Units: <span className="font-semibold text-foreground">Imperial (in / lbs)</span>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border/75 bg-surface-2 px-3 py-2 text-sm text-muted-foreground">
                Goal: <span className="font-semibold text-foreground">{form.goal || "Not set"}</span>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border/75 bg-surface-2 px-3 py-2 text-sm text-muted-foreground">
                Calories: <span className="font-semibold text-foreground">{form.calorieTarget || "-"}</span>
              </div>
            </div>
            <Badge variant="primary">Step {currentStep + 1} of 3</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
