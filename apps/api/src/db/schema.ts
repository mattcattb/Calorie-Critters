import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  uuid,
} from "drizzle-orm/pg-core";
import { GOAL_STATUSES, GOAL_TYPES, NICOTINE_TYPES } from "shared";

export const nicotineTypeEnum = pgEnum("nicotine_type", NICOTINE_TYPES);
export const goalTypeEnum = pgEnum("goal_type", GOAL_TYPES);
export const goalStatusEnum = pgEnum("goal_status", GOAL_STATUSES);

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status"),
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

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  cancelAt: timestamp("cancel_at"),
  canceledAt: timestamp("canceled_at"),
  endedAt: timestamp("ended_at"),
  seats: integer("seats"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// App-specific tables

// Product presets - user's saved products with default nicotine/cost
export const product = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name").notNull(),
  type: nicotineTypeEnum("type").notNull(), // cigarette, vape, zyn, pouch, gum, patch, other
  nicotineMg: real("nicotine_mg").notNull(),
  costPerUnit: real("cost_per_unit"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Nicotine entries - individual usage logs
export const nicotineEntry = pgTable("nicotine_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  type: nicotineTypeEnum("type").notNull(), // cigarette, vape, zyn, pouch, gum, patch, other
  amount: integer("amount").notNull().default(1),
  nicotineMg: real("nicotine_mg").notNull(),
  cost: real("cost"), // cost for this entry
  productId: uuid("product_id").references(() => product.id), // optional link to product preset
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Quitting goals
export const goal = pgTable("goal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  goalType: goalTypeEnum("goal_type").notNull(), // daily_limit, reduction, quit_date
  targetValue: real("target_value"), // mg for daily_limit, percentage for reduction
  targetDate: timestamp("target_date"), // target date for quit_date/reduction goals
  startDate: timestamp("start_date").notNull().defaultNow(),
  status: goalStatusEnum("status").notNull().default("active"), // active, completed, abandoned
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
