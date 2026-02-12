import type {
  MEAL_TYPES,
  ACTIVITY_LEVELS,
  GOALS,
  SEX_OPTIONS,
  UNIT_SYSTEMS,
  PET_TEMPLATE_IDS,
  PET_STAGES,
  PET_MOODS,
  PET_INTERACTION_TYPES,
  PET_ANIMATIONS,
} from "./constants";

export type MealType = (typeof MEAL_TYPES)[number];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type Goal = (typeof GOALS)[number];
export type Sex = (typeof SEX_OPTIONS)[number];
export type UnitSystem = (typeof UNIT_SYSTEMS)[number];
export type PetTemplateId = (typeof PET_TEMPLATE_IDS)[number];
export type PetStage = (typeof PET_STAGES)[number];
export type PetMood = (typeof PET_MOODS)[number];
export type PetInteractionType = (typeof PET_INTERACTION_TYPES)[number];
export type PetAnimation = (typeof PET_ANIMATIONS)[number];

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

export type PetTemplate = {
  id: PetTemplateId;
  name: string;
  species: string;
  personality: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  earStyle: "pointed" | "long" | "round";
  greetingLines: string[];
  emotes: Record<PetMood, string>;
};

export type UserPet = {
  id: string;
  userId: string;
  templateId: PetTemplateId;
  name: string;
  stage: PetStage;
  mood: PetMood;
  energy: number;
  affection: number;
  lastInteractedAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PetStateSnapshot = {
  mood: PetMood;
  animation: PetAnimation;
  emote: string;
  bubbleText: string | null;
  canInteract: boolean;
};

export type UserPetBundle = {
  pet: UserPet;
  template: PetTemplate;
  snapshot: PetStateSnapshot;
};
