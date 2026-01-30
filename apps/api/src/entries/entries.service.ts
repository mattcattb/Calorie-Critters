import { eq, desc, and, gte } from "drizzle-orm";
import { calculateBloodstreamStats, calculateCostStats } from "shared";
import { db } from "../db";
import { nicotineEntry, product } from "../db/schema";
import type { CreateEntryInput } from "./entries.schema";

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
    await db
      .delete(nicotineEntry)
      .where(and(eq(nicotineEntry.id, id), eq(nicotineEntry.userId, userId)));
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

    return calculateBloodstreamStats(entries, { now: new Date() });
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
