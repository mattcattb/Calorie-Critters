import type { UserProfile } from "@calorie-critters/shared";

export function isProfileOnboardingComplete(
  profile: UserProfile | null | undefined,
): boolean {
  if (!profile) return false;

  const requiredNumbers = [
    profile.height,
    profile.weight,
    profile.calorieTarget,
    profile.proteinTarget,
    profile.carbTarget,
    profile.fatTarget,
  ];

  const hasNumbers = requiredNumbers.every(
    (value) => typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  return Boolean(
    hasNumbers &&
      profile.sex &&
      profile.dateOfBirth &&
      profile.activityLevel &&
      profile.goal,
  );
}
