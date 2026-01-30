import { eq, and, gte, desc } from "drizzle-orm";
import { calculateGoalProgress } from "@nicflow/shared";
import { db } from "../db";
import { goal, nicotineEntry } from "../db/schema";
import type { CreateGoalInput, UpdateGoalInput } from "./goals.schema";

export const goalsService = {
  async getAll(userId: string) {
    return db
      .select()
      .from(goal)
      .where(eq(goal.userId, userId))
      .orderBy(desc(goal.createdAt));
  },

  async getActive(userId: string) {
    return db
      .select()
      .from(goal)
      .where(and(eq(goal.userId, userId), eq(goal.status, "active")))
      .orderBy(desc(goal.createdAt));
  },

  async getById(userId: string, id: string) {
    const [g] = await db
      .select()
      .from(goal)
      .where(and(eq(goal.id, id), eq(goal.userId, userId)));
    return g;
  },

  async create(userId: string, input: CreateGoalInput) {
    const [g] = await db
      .insert(goal)
      .values({
        userId,
        goalType: input.goalType,
        targetValue: input.targetValue,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
      })
      .returning();

    return g;
  },

  async update(userId: string, id: string, input: UpdateGoalInput) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.targetValue !== undefined) {
      updateData.targetValue = input.targetValue;
    }
    if (input.targetDate !== undefined) {
      updateData.targetDate = new Date(input.targetDate);
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const [g] = await db
      .update(goal)
      .set(updateData)
      .where(and(eq(goal.id, id), eq(goal.userId, userId)))
      .returning();

    return g;
  },

  async delete(userId: string, id: string) {
    await db.delete(goal).where(and(eq(goal.id, id), eq(goal.userId, userId)));
  },

  async getProgress(userId: string, goalId: string) {
    const g = await this.getById(userId, goalId);
    if (!g) return null;

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get today's entries for progress calculation
    const entries = await db
      .select()
      .from(nicotineEntry)
      .where(
        and(eq(nicotineEntry.userId, userId), gte(nicotineEntry.timestamp, dayAgo))
      );

    return calculateGoalProgress(
      {
        id: g.id,
        goalType: g.goalType,
        targetValue: g.targetValue,
        targetDate: g.targetDate ?? undefined,
        startDate: g.startDate,
      },
      entries,
      { now }
    );
  },
};
