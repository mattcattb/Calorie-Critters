import { and, gte, eq, desc } from "drizzle-orm";
import { calculateNicotineRemaining } from "@nicflow/shared";
import { db } from "../db";
import { nicotineEntry } from "../db/schema";

const clampInt = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const insightsService = {
  async getUsageByHour(userId: string, days = 7) {
    const safeDays = clampInt(days, 1, 90);
    const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const entries = await db
      .select({
        timestamp: nicotineEntry.timestamp,
        type: nicotineEntry.type,
      })
      .from(nicotineEntry)
      .where(and(eq(nicotineEntry.userId, userId), gte(nicotineEntry.timestamp, since)))
      .orderBy(desc(nicotineEntry.timestamp));

    const buckets: Record<string, number> = {};
    for (let hour = 0; hour < 24; hour += 1) {
      buckets[String(hour)] = 0;
    }

    const byType: Record<string, Record<string, number>> = {};

    for (const entry of entries) {
      const hour = new Date(entry.timestamp).getHours();
      buckets[String(hour)] += 1;

      if (!byType[entry.type]) {
        byType[entry.type] = { ...buckets };
      }
      byType[entry.type][String(hour)] += 1;
    }

    return {
      days: safeDays,
      totalEntries: entries.length,
      byHour: buckets,
      byHourAndType: byType,
    };
  },

  async getUsageByType(userId: string, days = 30) {
    const safeDays = clampInt(days, 1, 365);
    const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const entries = await db
      .select({
        type: nicotineEntry.type,
      })
      .from(nicotineEntry)
      .where(and(eq(nicotineEntry.userId, userId), gte(nicotineEntry.timestamp, since)));

    const counts: Record<string, number> = {};
    for (const entry of entries) {
      counts[entry.type] = (counts[entry.type] ?? 0) + 1;
    }

    return {
      days: safeDays,
      totalEntries: entries.length,
      byType: counts,
    };
  },

  async getLevelSeries(userId: string, hours = 24, intervalMinutes = 30) {
    const safeHours = clampInt(hours, 1, 168);
    const safeInterval = clampInt(intervalMinutes, 5, 240);
    const now = new Date();
    const since = new Date(now.getTime() - safeHours * 60 * 60 * 1000);

    const entries = await db
      .select({
        nicotineMg: nicotineEntry.nicotineMg,
        timestamp: nicotineEntry.timestamp,
      })
      .from(nicotineEntry)
      .where(and(eq(nicotineEntry.userId, userId), gte(nicotineEntry.timestamp, since)))
      .orderBy(desc(nicotineEntry.timestamp));

    const points: Array<{ timestamp: string; levelMg: number }> = [];
    const intervalMs = safeInterval * 60 * 1000;

    for (let ts = since.getTime(); ts <= now.getTime(); ts += intervalMs) {
      const current = new Date(ts);
      let level = 0;
      for (const entry of entries) {
        level += calculateNicotineRemaining(entry.nicotineMg, entry.timestamp, current);
      }
      points.push({
        timestamp: current.toISOString(),
        levelMg: Math.round(level * 100) / 100,
      });
    }

    return {
      hours: safeHours,
      intervalMinutes: safeInterval,
      points,
    };
  },
};
