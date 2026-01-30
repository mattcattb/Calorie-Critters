import { NICOTINE_HALF_LIFE_HOURS } from "./constants";
import type { GoalType } from "./constants";
import type { BloodstreamStats, CostStats, GoalProgress, TimestampLike } from "./types";

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
  entries: Array<{ cost?: number | null; timestamp: TimestampLike }>,
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

export type GoalLike = {
  id: string;
  goalType: GoalType;
  targetValue?: number | null;
  targetDate?: TimestampLike | null;
  startDate: TimestampLike;
};

export const calculateGoalProgress = (
  goal: GoalLike,
  entries: Array<{ nicotineMg: number; timestamp: TimestampLike }>,
  options?: { now?: TimestampLike }
): GoalProgress => {
  const now = toDate(options?.now ?? new Date());
  const startDate = toDate(goal.startDate);
  const targetDate = goal.targetDate ? toDate(goal.targetDate) : undefined;

  const todayTotal = entries.reduce((sum, e) => sum + e.nicotineMg, 0);

  let percentComplete = 0;
  let onTrack = false;
  let daysRemaining: number | undefined;

  switch (goal.goalType) {
    case "daily_limit":
      if (goal.targetValue) {
        percentComplete = Math.min(100, (todayTotal / goal.targetValue) * 100);
        onTrack = todayTotal <= goal.targetValue;
      }
      break;
    case "reduction":
      if (targetDate) {
        const totalDays = Math.ceil(
          (targetDate.getTime() - startDate.getTime()) / MS_PER_DAY
        );
        const daysPassed = Math.ceil(
          (now.getTime() - startDate.getTime()) / MS_PER_DAY
        );
        daysRemaining = Math.max(0, totalDays - daysPassed);
        percentComplete = Math.min(100, (daysPassed / totalDays) * 100);
        onTrack = now < targetDate;
      }
      break;
    case "quit_date":
      if (targetDate) {
        const totalDays = Math.ceil(
          (targetDate.getTime() - startDate.getTime()) / MS_PER_DAY
        );
        const daysPassed = Math.ceil(
          (now.getTime() - startDate.getTime()) / MS_PER_DAY
        );
        daysRemaining = Math.max(0, totalDays - daysPassed);
        percentComplete = Math.min(100, (daysPassed / totalDays) * 100);
        onTrack = now < targetDate;
      }
      break;
  }

  return {
    goalId: goal.id,
    goalType: goal.goalType,
    currentValue: Math.round(todayTotal * 100) / 100,
    targetValue: goal.targetValue ?? undefined,
    percentComplete: Math.round(percentComplete),
    daysRemaining,
    onTrack,
  };
};
