import { db } from "../db";
import { goal, nicotineEntry } from "../db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
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

    const todayTotal = entries.reduce((sum, e) => sum + e.nicotineMg, 0);

    let percentComplete = 0;
    let onTrack = false;
    let daysRemaining: number | undefined;

    switch (g.goalType) {
      case "daily_limit":
        if (g.targetValue) {
          // For daily limit, being under target is good
          // percentComplete shows how much of limit is used
          percentComplete = Math.min(100, (todayTotal / g.targetValue) * 100);
          onTrack = todayTotal <= g.targetValue;
        }
        break;

      case "reduction":
        // For reduction goals, track progress toward target date
        if (g.targetDate) {
          const totalDays = Math.ceil(
            (g.targetDate.getTime() - g.startDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          const daysPassed = Math.ceil(
            (now.getTime() - g.startDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          daysRemaining = Math.max(0, totalDays - daysPassed);
          percentComplete = Math.min(100, (daysPassed / totalDays) * 100);
          onTrack = now < g.targetDate;
        }
        break;

      case "quit_date":
        // For quit date, track days until target
        if (g.targetDate) {
          const totalDays = Math.ceil(
            (g.targetDate.getTime() - g.startDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          const daysPassed = Math.ceil(
            (now.getTime() - g.startDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          daysRemaining = Math.max(0, totalDays - daysPassed);
          percentComplete = Math.min(100, (daysPassed / totalDays) * 100);
          onTrack = now < g.targetDate;
        }
        break;
    }

    return {
      goalId: g.id,
      goalType: g.goalType,
      currentValue: Math.round(todayTotal * 100) / 100,
      targetValue: g.targetValue,
      percentComplete: Math.round(percentComplete),
      daysRemaining,
      onTrack,
    };
  },
};
