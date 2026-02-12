import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  real,
  date,
} from "drizzle-orm/pg-core";

// ── Better Auth tables ──────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Calorie Critters domain tables ──────────────────────────────────

export const userProfile = pgTable("user_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  height: real("height"), // cm or inches depending on unitSystem
  weight: real("weight"), // kg or lbs depending on unitSystem
  sex: text("sex"), // male, female, other
  dateOfBirth: date("date_of_birth"),
  activityLevel: text("activity_level"), // sedentary, light, moderate, active, very_active
  goal: text("goal"), // lose, maintain, gain
  calorieTarget: integer("calorie_target"),
  proteinTarget: integer("protein_target"), // grams
  carbTarget: integer("carb_target"), // grams
  fatTarget: integer("fat_target"), // grams
  unitSystem: text("unit_system").notNull().default("metric"), // metric, imperial
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const foodItem = pgTable("food_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  brand: text("brand"),
  servingSize: real("serving_size").notNull(), // e.g. 100
  servingUnit: text("serving_unit").notNull(), // e.g. "g", "ml", "oz"
  calories: real("calories").notNull(),
  protein: real("protein").notNull(), // grams
  carbs: real("carbs").notNull(), // grams
  fat: real("fat").notNull(), // grams
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const foodEntry = pgTable("food_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  foodItemId: uuid("food_item_id")
    .notNull()
    .references(() => foodItem.id),
  servings: real("servings").notNull().default(1),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  loggedAt: date("logged_at").notNull(), // the date this entry is for
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailySummary = pgTable("daily_summary", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  date: date("date").notNull(),
  totalCalories: real("total_calories").notNull().default(0),
  totalProtein: real("total_protein").notNull().default(0),
  totalCarbs: real("total_carbs").notNull().default(0),
  totalFat: real("total_fat").notNull().default(0),
  goalMet: boolean("goal_met").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPet = pgTable("user_pet", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id),
  templateId: text("template_id").notNull().default("sprout_fox"),
  name: text("name").notNull().default("Sprout"),
  stage: text("stage").notNull().default("baby"),
  mood: text("mood").notNull().default("curious"),
  energy: integer("energy").notNull().default(70),
  affection: integer("affection").notNull().default(50),
  lastInteractedAt: timestamp("last_interacted_at"),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const petEvent = pgTable("pet_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  userPetId: uuid("user_pet_id")
    .notNull()
    .references(() => userPet.id),
  type: text("type").notNull(),
  route: text("route"),
  payload: text("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
