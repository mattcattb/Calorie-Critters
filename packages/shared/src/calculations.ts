import { NICOTINE_HALF_LIFE_HOURS } from "./constants";
import type { BloodstreamStats, CostStats, TimestampLike } from "./types";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export const toDate = (value: TimestampLike): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const calculateNicotineRemaining = (
  nicotineMg: number,
  takenAt: TimestampLike,
  now: TimestampLike = new Date(),
  halfLifeHours = NICOTINE_HALF_LIFE_HOURS
) => {
  const takenAtDate = toDate(takenAt).getTime();
  const nowDate = toDate(now).getTime();
  const timePassed = Math.max(0, nowDate - takenAtDate);
  const halfLives = timePassed / (halfLifeHours * MS_PER_HOUR);
  return nicotineMg * Math.pow(0.5, halfLives);
};

export const calculateBloodstreamStats = (
  entries: Array<{ nicotineMg: number; timestamp: TimestampLike }>,
  options?: { now?: TimestampLike; windowHours?: number }
): BloodstreamStats => {
  const now = toDate(options?.now ?? new Date());
  const windowHours = options?.windowHours ?? 24;
  const since = new Date(now.getTime() - windowHours * MS_PER_HOUR);

  const recentEntries = entries.filter(
    (entry) => toDate(entry.timestamp).getTime() >= since.getTime()
  );

  let currentLevel = 0;
  for (const entry of recentEntries) {
    currentLevel += calculateNicotineRemaining(
      entry.nicotineMg,
      entry.timestamp,
      now
    );
  }

  return {
    currentLevelMg: Math.round(currentLevel * 100) / 100,
    entriesLast24h: recentEntries.length,
    totalNicotineMg: recentEntries.reduce((sum, e) => sum + e.nicotineMg, 0),
  };
};

export const calculateCostStats = (
  entries: Array<{ cost?: number; timestamp: TimestampLike }>,
  options?: { now?: TimestampLike }
): CostStats => {
  const now = toDate(options?.now ?? new Date());
  const dayAgo = now.getTime() - MS_PER_DAY;
  const weekAgo = now.getTime() - 7 * MS_PER_DAY;
  const monthAgo = now.getTime() - 30 * MS_PER_DAY;

  let dailySpending = 0;
  let weeklySpending = 0;
  let monthlySpending = 0;

  for (const entry of entries) {
    const cost = entry.cost ?? 0;
    const ts = toDate(entry.timestamp).getTime();
    if (ts >= monthAgo) {
      monthlySpending += cost;
      if (ts >= weekAgo) {
        weeklySpending += cost;
        if (ts >= dayAgo) {
          dailySpending += cost;
        }
      }
    }
  }

  return {
    dailySpending: Math.round(dailySpending * 100) / 100,
    weeklySpending: Math.round(weeklySpending * 100) / 100,
    monthlySpending: Math.round(monthlySpending * 100) / 100,
  };
};
