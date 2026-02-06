import { eq, desc, and, gte } from "drizzle-orm";
import { calculateBloodstreamStats, calculateCostStats } from "@nicflow/shared";
import { NotFoundException } from "../common/errors";
import { db } from "../db";
import { nicotineEntry, product } from "../db/schema";
import { onboardingService } from "../onboarding/onboarding.service";
import type { CreateEntryInput, UpdateEntryInput } from "./entries.schema";

export const entriesService = {
  async getAll(userId: string, limit = 100) {
    return db
      .select()
      .from(nicotineEntry)
      .where(eq(nicotineEntry.userId, userId))
      .orderBy(desc(nicotineEntry.timestamp))
      .limit(limit);
  },

  async create(userId: string, input: CreateEntryInput) {
    let cost = input.cost;

    // If productId provided and no cost, fetch product to auto-fill cost
    if (input.productId && !cost) {
      const [prod] = await db
        .select()
        .from(product)
        .where(and(eq(product.id, input.productId), eq(product.userId, userId)));
      if (prod?.costPerUnit) {
        cost = prod.costPerUnit * (input.amount || 1);
      }
    }

    const [entry] = await db
      .insert(nicotineEntry)
      .values({
        userId,
        type: input.type,
        amount: input.amount,
        nicotineMg: input.nicotineMg,
        cost,
        productId: input.productId,
        timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
        notes: input.notes,
      })
      .returning();

    return entry;
  },

  async delete(userId: string, id: string) {
    const deleted = await db
      .delete(nicotineEntry)
      .where(and(eq(nicotineEntry.id, id), eq(nicotineEntry.userId, userId)))
      .returning({ id: nicotineEntry.id });
    if (deleted.length === 0) {
      throw new NotFoundException("Entry not found");
    }
  },

  async update(userId: string, id: string, input: UpdateEntryInput) {
    const [existing] = await db
      .select()
      .from(nicotineEntry)
      .where(and(eq(nicotineEntry.id, id), eq(nicotineEntry.userId, userId)));
    if (!existing) {
      throw new NotFoundException("Entry not found");
    }

    const updateData: Record<string, unknown> = {};

    if (input.type !== undefined) updateData.type = input.type;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.nicotineMg !== undefined) updateData.nicotineMg = input.nicotineMg;
    if (input.cost !== undefined) updateData.cost = input.cost;
    if (input.productId !== undefined) updateData.productId = input.productId;
    if (input.timestamp !== undefined) {
      updateData.timestamp = new Date(input.timestamp);
    }
    if (input.notes !== undefined) updateData.notes = input.notes;

    if (input.productId && input.cost === undefined) {
      const [prod] = await db
        .select()
        .from(product)
        .where(and(eq(product.id, input.productId), eq(product.userId, userId)));
      if (prod?.costPerUnit) {
        const amount = input.amount ?? existing.amount ?? 1;
        updateData.cost = prod.costPerUnit * amount;
      }
    }

    const [updated] = await db
      .update(nicotineEntry)
      .set(updateData)
      .where(and(eq(nicotineEntry.id, id), eq(nicotineEntry.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundException("Entry not found");
    }
    return updated;
  },

  async getStats(userId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const entries = await db
      .select()
      .from(nicotineEntry)
      .where(
        and(eq(nicotineEntry.userId, userId), gte(nicotineEntry.timestamp, since))
      )
      .orderBy(desc(nicotineEntry.timestamp));

    const profile = await onboardingService.getProfile(userId);
    return calculateBloodstreamStats(entries, { now: new Date(), profile });
  },

  async getCostStats(userId: string) {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const entries = await db
      .select()
      .from(nicotineEntry)
      .where(
        and(eq(nicotineEntry.userId, userId), gte(nicotineEntry.timestamp, monthAgo))
      );

    return calculateCostStats(entries, { now });
  },
};
