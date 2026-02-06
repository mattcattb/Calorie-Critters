import { NICOTINE_HALF_LIFE_HOURS } from "./constants";
import type { GoalType } from "./constants";
import type {
  BloodstreamStats,
  BodyProfile,
  CostStats,
  GoalProgress,
  TimestampLike,
} from "./types";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const DEFAULT_WEIGHT_KG = 70;
const LB_TO_KG = 0.45359237;

const toWeightKg = (weight?: number | null, unit?: "kg" | "lb" | null) => {
  if (!weight || weight <= 0 || !unit) return null;
  return unit === "lb" ? weight * LB_TO_KG : weight;
};

const getSexAdjustment = (sex?: BodyProfile["sex"] | null) => {
  switch (sex) {
    case "female":
      return 0.97;
    case "male":
      return 1.0;
    case "intersex":
      return 1.0;
    case "prefer_not_to_say":
    default:
      return 1.0;
  }
};

const getProfileAdjustment = (profile?: BodyProfile | null) => {
  if (!profile) return 1;
  let factor = 1;
  const weightKg = toWeightKg(profile.weight, profile.weightUnit);
  if (weightKg) {
    factor *= DEFAULT_WEIGHT_KG / weightKg;
  }
  factor *= getSexAdjustment(profile.sex);
  return factor;
};

export const toDate = (value: TimestampLike): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const calculateNicotineRemaining = (
  nicotineMg: number,
  takenAt: TimestampLike,
  now: TimestampLike = new Date(),
  halfLifeHours = NICOTINE_HALF_LIFE_HOURS,
  profile?: BodyProfile
) => {
  const takenAtDate = toDate(takenAt).getTime();
  const nowDate = toDate(now).getTime();
  const timePassed = Math.max(0, nowDate - takenAtDate);
  const halfLives = timePassed / (halfLifeHours * MS_PER_HOUR);
  const adjustment = getProfileAdjustment(profile);
  return nicotineMg * Math.pow(0.5, halfLives) * adjustment;
};

export const calculateBloodstreamStats = (
  entries: Array<{
    nicotineMg: number;
    timestamp: TimestampLike;
    amount?: number | null;
  }>,
  options?: {
    now?: TimestampLike;
    windowHours?: number;
    profile?: BodyProfile;
    baselineLevelMg?: number;
    baselineWindowHours?: number;
    sampleMinutes?: number;
  }
): BloodstreamStats => {
  const now = toDate(options?.now ?? new Date());
  const windowHours = options?.windowHours ?? 24;
  const since = new Date(now.getTime() - windowHours * MS_PER_HOUR);
  const adjustment = getProfileAdjustment(options?.profile);
  const baselineLevelMg = options?.baselineLevelMg ?? 2;
  const baselineWindowHours = options?.baselineWindowHours ?? 24;
  const sampleMinutes = options?.sampleMinutes ?? 5;

  const recentEntries = entries.filter(
    (entry) => toDate(entry.timestamp).getTime() >= since.getTime()
  );

  const calculateLevelAt = (time: Date, sourceEntries = entries) => {
    let total = 0;
    for (const entry of sourceEntries) {
      total += calculateNicotineRemaining(
        entry.nicotineMg,
        entry.timestamp,
        time,
        undefined,
        options?.profile
      );
    }
    return total;
  };

  const currentLevel = calculateLevelAt(now, recentEntries);

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const todayEntries = entries.filter(
    (entry) => toDate(entry.timestamp).getTime() >= startOfDay.getTime()
  );
  const todayUsage = todayEntries.reduce(
    (sum, entry) => sum + (entry.amount ?? 1),
    0
  );

  const peakSteps = Math.ceil(
    (now.getTime() - startOfDay.getTime()) / (sampleMinutes * 60 * 1000)
  );
  let peakLevel = 0;
  for (let i = 0; i <= peakSteps; i += 1) {
    const time = new Date(startOfDay.getTime() + i * sampleMinutes * 60 * 1000);
    peakLevel = Math.max(peakLevel, calculateLevelAt(time));
  }

  const baselineSteps = Math.ceil(
    (baselineWindowHours * 60) / sampleMinutes
  );
  let timeToBaselineHours = baselineWindowHours;
  for (let i = 0; i <= baselineSteps; i += 1) {
    const time = new Date(now.getTime() + i * sampleMinutes * 60 * 1000);
    if (calculateLevelAt(time) <= baselineLevelMg) {
      timeToBaselineHours = (i * sampleMinutes) / 60;
      break;
    }
  }

  return {
    currentLevelMg: Math.round(currentLevel * 100) / 100,
    entriesLast24h: recentEntries.length,
    totalNicotineMg: recentEntries.reduce((sum, e) => sum + e.nicotineMg, 0),
    todayUsage,
    peakLevelTodayMg: Math.round(peakLevel * 100) / 100,
    timeToBaselineHours: Math.round(timeToBaselineHours * 100) / 100,
    adjustmentApplied: adjustment !== 1,
    adjustmentFactor: Math.round(adjustment * 100) / 100,
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
