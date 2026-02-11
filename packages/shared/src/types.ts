import type {
  MEAL_TYPES,
  ACTIVITY_LEVELS,
  GOALS,
  SEX_OPTIONS,
  UNIT_SYSTEMS,
} from "./constants";

export type MealType = (typeof MEAL_TYPES)[number];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type Goal = (typeof GOALS)[number];
export type Sex = (typeof SEX_OPTIONS)[number];
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];

export type UserProfile = {
  id: string;
  userId: string;
  height: number | null;
  weight: number | null;
  sex: Sex | null;
  dateOfBirth: string | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
  unitSystem: UnitSystem;
};

export type FoodItem = {
  id: string;
  name: string;
  brand: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type FoodEntry = {
  id: string;
  userId: string;
  foodItemId: string;
  servings: number;
  mealType: MealType;
  loggedAt: string;
  notes: string | null;
};

export type DailySummary = {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalMet?: boolean;
};

export type EntryWithFood = {
  entry: FoodEntry;
  food: FoodItem;
};
