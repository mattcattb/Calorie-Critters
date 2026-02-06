// Nicotine product types
export const NICOTINE_TYPES = [
  "cigarette",
  "vape",
  "zyn",
  "pouch",
  "gum",
  "patch",
  "other",
] as const;

export type NicotineType = (typeof NICOTINE_TYPES)[number];

// Goal types
export const GOAL_TYPES = ["daily_limit", "reduction", "quit_date"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

// Goal statuses
export const GOAL_STATUSES = ["active", "completed", "abandoned"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

// Onboarding profile options
export const SEXES = [
  "female",
  "male",
  "intersex",
  "prefer_not_to_say",
] as const;
export type Sex = (typeof SEXES)[number];

export const WEIGHT_UNITS = ["kg", "lb"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

// Nicotine half-life is approximately 2 hours
export const NICOTINE_HALF_LIFE_HOURS = 2;

// Default nicotine content (mg) per product type
export const DEFAULT_NICOTINE_MG: Record<NicotineType, number> = {
  cigarette: 1.2,
  vape: 1.5,
  zyn: 6,
  pouch: 4,
  gum: 2,
  patch: 21,
  other: 1,
};
