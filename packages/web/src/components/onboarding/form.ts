import type { UpsertProfileInput, UserProfile, UnitSystem, Sex, ActivityLevel, Goal } from "@calorie-critters/shared";

export type ProfileFormState = {
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

export const DEFAULT_PROFILE_FORM: ProfileFormState = {
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
  unitSystem: "imperial",
};

export function mapProfileToForm(profile: UserProfile | null): ProfileFormState {
  if (!profile) return DEFAULT_PROFILE_FORM;
  return {
    height: profile.height === null ? "" : String(profile.height),
    weight: profile.weight === null ? "" : String(profile.weight),
    sex: profile.sex ?? "",
    dateOfBirth: profile.dateOfBirth ?? "",
    activityLevel: profile.activityLevel ?? "",
    goal: profile.goal ?? "",
    calorieTarget:
      profile.calorieTarget === null ? "" : String(profile.calorieTarget),
    proteinTarget:
      profile.proteinTarget === null ? "" : String(profile.proteinTarget),
    carbTarget: profile.carbTarget === null ? "" : String(profile.carbTarget),
    fatTarget: profile.fatTarget === null ? "" : String(profile.fatTarget),
    unitSystem: profile.unitSystem,
  };
}

export function parseNumberOrNull(value: string, asInteger = false): number | null {
  if (!value.trim()) return null;
  const parsed = asInteger ? Number.parseInt(value, 10) : Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function toProfilePayload(form: ProfileFormState): UpsertProfileInput {
  return {
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
}

export function isOnboardingPayloadComplete(payload: UpsertProfileInput): boolean {
  const requiredNumbers = [
    payload.height,
    payload.weight,
    payload.calorieTarget,
    payload.proteinTarget,
    payload.carbTarget,
    payload.fatTarget,
  ];

  const hasNumbers = requiredNumbers.every(
    (value) => typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  return Boolean(
    hasNumbers &&
      payload.sex &&
      payload.dateOfBirth &&
      payload.activityLevel &&
      payload.goal,
  );
}
