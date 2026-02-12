import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateBMR,
  calculateMacroTargets,
  calculateTDEE,
  convertHeight,
  convertWeight,
  type UpsertProfileInput,
  type UserProfile,
} from "@calorie-critters/shared";
import { Button, Card, CardContent, useToast } from "../components/ui";
import { useSession } from "../lib/auth";
import { honoClient } from "../lib/hono.client";
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

const STEP_LABELS = ["Goal", "About You", "Set Targets"];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

function validateStep(step: number, form: ProfileFormState): string | null {
  if (step === 0) {
    if (!form.goal) {
      return "Please choose your goal.";
    }
    return null;
  }

  if (step === 1) {
    if (!form.age || !form.heightFeet || form.heightInches === "" || !form.weight || !form.sex || !form.activityLevel) {
      return "Please complete age, height, weight, gender, and activity level.";
    }

    const age = parseNumberOrNull(form.age, true);
    const heightFeet = parseNumberOrNull(form.heightFeet, true);
    const heightInches = parseNumberOrNull(form.heightInches);
    const weight = parseNumberOrNull(form.weight);

    if (
      age === null ||
      age <= 0 ||
      heightFeet === null ||
      heightFeet < 0 ||
      heightInches === null ||
      heightInches < 0 ||
      heightInches > 11 ||
      weight === null ||
      weight <= 0
    ) {
      return "Enter valid values (inches must be between 0 and 11).";
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
    queryFn: () => honoClient.profile.get<UserProfile | null>(),
    enabled: Boolean(session && !isPending),
  });

  useEffect(() => {
    if (profileQuery.data !== undefined) {
      const mapped = mapProfileToForm(profileQuery.data);

      if (profileQuery.data?.unitSystem === "metric") {
        if (profileQuery.data.height !== null) {
          const imperialHeight = convertHeight(profileQuery.data.height, "metric", "imperial");
          const feet = Math.floor(imperialHeight / 12);
          const inches = Math.round((imperialHeight % 12) * 10) / 10;
          mapped.heightFeet = String(feet);
          mapped.heightInches = String(inches);
        }

        if (profileQuery.data.weight !== null) {
          mapped.weight = String(Math.round(convertWeight(profileQuery.data.weight, "metric", "imperial") * 10) / 10);
        }
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
      honoClient.profile.update<UserProfile>(payload),
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
  const isCurrentStepValid = !stepValidationError;

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const patchForm = (patch: Partial<ProfileFormState>) => {
    setForm((prev) => ({ ...prev, ...patch, unitSystem: "imperial" }));
  };

  const handleAutoCalculate = () => {
    if (!form.goal || !form.sex || !form.activityLevel || !form.age || !form.heightFeet || form.heightInches === "" || !form.weight) {
      notify({
        type: "error",
        title: "Missing fields",
        description: "Fill goal and About You first to auto-calculate targets.",
      });
      return;
    }

    const age = parseNumberOrNull(form.age, true);
    const heightFeet = parseNumberOrNull(form.heightFeet, true);
    const heightInches = parseNumberOrNull(form.heightInches);
    const weightInput = parseNumberOrNull(form.weight);

    if (
      age === null ||
      age <= 0 ||
      heightFeet === null ||
      heightFeet < 0 ||
      heightInches === null ||
      heightInches < 0 ||
      heightInches > 11 ||
      weightInput === null ||
      weightInput <= 0
    ) {
      notify({ type: "error", title: "Invalid measurements", description: "Please enter valid age, height, and weight." });
      return;
    }

    const heightTotalInches = heightFeet * 12 + heightInches;
    const weightKg = convertWeight(weightInput, "imperial", "metric");
    const heightCm = convertHeight(heightTotalInches, "imperial", "metric");

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
    <div className="min-h-[100dvh] w-full bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            {canGoBack ? (
              <Button type="button" variant="ghost" className="px-2 text-muted-foreground" onClick={goPreviousStep}>
                Back
              </Button>
            ) : (
              <div className="w-16" />
            )}
            <div className="w-full max-w-[260px]">
              <StepProgress steps={STEP_LABELS} currentStep={currentStep} />
            </div>
            <div className="w-16" />
          </div>

          <h1 className="text-center text-5xl font-black tracking-tight text-slate-800">{STEP_LABELS[currentStep]}</h1>
        </div>

        <Card className="rounded-[2rem] border-slate-200 p-2 sm:p-4">
          <CardContent className="space-y-4 p-2 sm:p-3">
            {profileQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : (
              <>
                {currentStep === 0 ? <LifestyleStep form={form} onChange={patchForm} /> : null}
                {currentStep === 1 ? <BasicsStep form={form} onChange={patchForm} /> : null}
                {currentStep === 2 ? <TargetsStep form={form} onChange={patchForm} onAutoCalculate={handleAutoCalculate} /> : null}

                {stepValidationError ? <p className="text-sm text-muted-foreground">{stepValidationError}</p> : null}

                <Button
                  type="button"
                  className="h-14 w-full rounded-[1.2rem] text-lg"
                  effect="glow"
                  onClick={isFinalStep ? handleFinish : goNextStep}
                  disabled={!isCurrentStepValid || saveMutation.isPending}
                >
                  {isFinalStep ? (saveMutation.isPending ? "Saving..." : "Finish") : "Continue"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
