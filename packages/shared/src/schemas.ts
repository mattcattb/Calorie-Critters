import { z } from "zod";
import { GOAL_STATUSES, GOAL_TYPES, NICOTINE_TYPES } from "./constants";

export const createEntrySchema = z.object({
  type: z.enum(NICOTINE_TYPES),
  amount: z.number().int().positive().default(1),
  nicotineMg: z.number().positive(),
  cost: z.number().positive().optional(),
  productId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateEntrySchema = createEntrySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(NICOTINE_TYPES),
  nicotineMg: z.number().positive(),
  costPerUnit: z.number().positive().optional(),
  isDefault: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const createGoalSchema = z.object({
  goalType: z.enum(GOAL_TYPES),
  targetValue: z.number().positive().optional(),
  targetDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
});

export const updateGoalSchema = z.object({
  targetValue: z.number().positive().optional(),
  targetDate: z.string().datetime().optional(),
  status: z.enum(GOAL_STATUSES).optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
