import type { ActivityLevel, Goal, Sex, UnitSystem } from "./types";

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Mifflin-St Jeor equation.
 * Expects weight in kg and height in cm regardless of unitSystem.
 * Use convertWeight/convertHeight first if values are in imperial.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateMacroTargets(
  tdee: number,
  goal: Goal,
): { calories: number; protein: number; carbs: number; fat: number } {
  let calories: number;
  switch (goal) {
    case "lose":
      calories = Math.round(tdee - 500);
      break;
    case "gain":
      calories = Math.round(tdee + 300);
      break;
    default:
      calories = Math.round(tdee);
  }

  // Standard macro split: 30% protein, 40% carbs, 30% fat
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.3) / 9);

  return { calories, protein, carbs, fat };
}

/** Convert weight between metric (kg) and imperial (lbs). */
export function convertWeight(
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) return value;
  return from === "metric" ? value * 2.20462 : value / 2.20462;
}

/** Convert height between metric (cm) and imperial (inches). */
export function convertHeight(
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) return value;
  return from === "metric" ? value / 2.54 : value * 2.54;
}
