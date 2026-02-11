import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "../db";
import { foodItem } from "../db/schema";
import type { CreateFoodItemInput, UpdateFoodItemInput } from "./foods.schema";

export const listFoodItems = async (userId: string, search?: string) => {
  const conditions = [eq(foodItem.createdBy, userId)];
  if (search) {
    conditions.push(ilike(foodItem.name, `%${search}%`));
  }
  return db
    .select()
    .from(foodItem)
    .where(and(...conditions))
    .orderBy(desc(foodItem.createdAt));
};

export const getFoodItem = async (id: string, userId: string) => {
  const [item] = await db
    .select()
    .from(foodItem)
    .where(and(eq(foodItem.id, id), eq(foodItem.createdBy, userId)));
  return item ?? null;
};

export const createFoodItem = async (
  userId: string,
  data: CreateFoodItemInput,
) => {
  const [created] = await db
    .insert(foodItem)
    .values({ createdBy: userId, ...data })
    .returning();
  return created;
};

export const updateFoodItem = async (
  id: string,
  userId: string,
  data: UpdateFoodItemInput,
) => {
  const [updated] = await db
    .update(foodItem)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(foodItem.id, id), eq(foodItem.createdBy, userId)))
    .returning();
  return updated ?? null;
};

export const deleteFoodItem = async (id: string, userId: string) => {
  const [deleted] = await db
    .delete(foodItem)
    .where(and(eq(foodItem.id, id), eq(foodItem.createdBy, userId)))
    .returning();
  return deleted ?? null;
};
