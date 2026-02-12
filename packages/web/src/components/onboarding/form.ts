import { calculateAge, type UpsertProfileInput, type UserProfile, type UnitSystem, type Sex, type ActivityLevel, type Goal } from "@calorie-critters/shared";

export type ProfileFormState = {
  heightFeet: string;
  heightInches: string;
  weight: string;
  age: string;
  sex: Sex | "";
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
  calorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
  unitSystem: UnitSystem;
};

export const DEFAULT_PROFILE_FORM: ProfileFormState = {
  heightFeet: "",
  heightInches: "",
  weight: "",
  age: "",
  sex: "",
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
  const heightInchesTotal = profile.height ?? null;
  const feet = heightInchesTotal === null ? "" : String(Math.floor(heightInchesTotal / 12));
  let inchesValue = "";
  if (heightInchesTotal !== null) {
    const remainder = Math.round((heightInchesTotal % 12) * 10) / 10;
    inchesValue = String(remainder);
  }

  return {
    heightFeet: feet,
    heightInches: inchesValue,
    weight: profile.weight === null ? "" : String(profile.weight),
    age: profile.dateOfBirth ? String(Math.max(0, calculateAge(profile.dateOfBirth))) : "",
    sex: profile.sex ?? "",
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

function deriveDateOfBirthFromAge(ageValue: string): string | null {
  const age = parseNumberOrNull(ageValue, true);
  if (age === null || age <= 0) return null;
  const now = new Date();
  const dob = new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
  return dob.toISOString().slice(0, 10);
}

export function toProfilePayload(form: ProfileFormState): UpsertProfileInput {
  const feet = parseNumberOrNull(form.heightFeet, true);
  const inches = parseNumberOrNull(form.heightInches);
  const heightTotalInches =
    feet !== null && feet >= 0 && inches !== null && inches >= 0
      ? feet * 12 + inches
      : null;

  return {
    height: heightTotalInches,
    weight: parseNumberOrNull(form.weight),
    sex: form.sex || null,
    dateOfBirth: deriveDateOfBirthFromAge(form.age),
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
