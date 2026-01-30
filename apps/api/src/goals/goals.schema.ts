import {z} from "zod";
import { GOAL_TYPES, GOAL_STATUSES } from "@nicflow/shared";

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

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
