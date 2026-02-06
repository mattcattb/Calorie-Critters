import type { GoalStatus, GoalType, NicotineType, Sex, WeightUnit } from "./constants";

export type TimestampLike = string | number | Date;

// Nicotine entry (API shape)
export interface NicotineEntry {
  id: string;
  userId: string;
  type: NicotineType;
  amount: number;
  nicotineMg: number;
  cost?: number;
  productId?: string;
  timestamp: string;
  notes?: string;
}

// Nicotine entry (stored/DB shape)
export interface NicotineEntryStored {
  id: string;
  userId: string;
  type: NicotineType;
  amount: number;
  nicotineMg: number;
  cost?: number;
  productId?: string;
  timestamp: Date;
  notes?: string;
}

// Product preset
export interface Product {
  id: string;
  userId: string;
  name: string;
  type: NicotineType;
  nicotineMg: number;
  costPerUnit?: number;
  isDefault: boolean;
}

// Quitting goal
export interface Goal {
  id: string;
  userId: string;
  goalType: GoalType;
  targetValue?: number;
  targetDate?: Date;
  startDate: Date;
  status: GoalStatus;
}

// Stats
export interface BloodstreamStats {
  currentLevelMg: number;
  entriesLast24h: number;
  totalNicotineMg: number;
  todayUsage: number;
  peakLevelTodayMg: number;
  timeToBaselineHours: number;
  adjustmentApplied?: boolean;
  adjustmentFactor?: number;
}

export interface CostStats {
  dailySpending: number;
  weeklySpending: number;
  monthlySpending: number;
}

export interface GoalProgress {
  goalId: string;
  goalType: GoalType;
  currentValue: number;
  targetValue?: number;
  percentComplete: number;
  daysRemaining?: number;
  onTrack: boolean;
}

export interface BodyProfile {
  sex?: Sex | null;
  weight?: number | null;
  weightUnit?: WeightUnit | null;
}

export interface UserProfile extends BodyProfile {
  onboardingCompleted?: boolean | null;
}
