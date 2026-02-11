import { and, between, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { dailySummary, foodEntry, foodItem } from "../db/schema";
import type { CreateEntryInput, UpdateEntryInput } from "./entries.schema";

export const listEntries = async (
  userId: string,
  filters: { date?: string; from?: string; to?: string },
) => {
  const conditions = [eq(foodEntry.userId, userId)];

  if (filters.date) {
    conditions.push(eq(foodEntry.loggedAt, filters.date));
  } else if (filters.from && filters.to) {
    conditions.push(between(foodEntry.loggedAt, filters.from, filters.to));
  }

  return db
    .select({
      entry: foodEntry,
      food: foodItem,
    })
    .from(foodEntry)
    .innerJoin(foodItem, eq(foodEntry.foodItemId, foodItem.id))
    .where(and(...conditions))
    .orderBy(desc(foodEntry.createdAt));
};

export const createEntry = async (
  userId: string,
  data: CreateEntryInput,
) => {
  const [created] = await db
    .insert(foodEntry)
    .values({ userId, ...data })
    .returning();
  return created;
};

export const updateEntry = async (
  id: string,
  userId: string,
  data: UpdateEntryInput,
) => {
  const [updated] = await db
    .update(foodEntry)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(foodEntry.id, id), eq(foodEntry.userId, userId)))
    .returning();
  return updated ?? null;
};

export const deleteEntry = async (id: string, userId: string) => {
  const [deleted] = await db
    .delete(foodEntry)
    .where(and(eq(foodEntry.id, id), eq(foodEntry.userId, userId)))
    .returning();
  return deleted ?? null;
};

export const getDailySummary = async (userId: string, date: string) => {
  // Compute from entries on the fly
  const entries = await db
    .select({
      totalCalories: sql<number>`coalesce(sum(${foodItem.calories} * ${foodEntry.servings}), 0)`,
      totalProtein: sql<number>`coalesce(sum(${foodItem.protein} * ${foodEntry.servings}), 0)`,
      totalCarbs: sql<number>`coalesce(sum(${foodItem.carbs} * ${foodEntry.servings}), 0)`,
      totalFat: sql<number>`coalesce(sum(${foodItem.fat} * ${foodEntry.servings}), 0)`,
    })
    .from(foodEntry)
    .innerJoin(foodItem, eq(foodEntry.foodItemId, foodItem.id))
    .where(and(eq(foodEntry.userId, userId), eq(foodEntry.loggedAt, date)));

  const totals = entries[0] ?? {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };

  return { date, ...totals };
};
