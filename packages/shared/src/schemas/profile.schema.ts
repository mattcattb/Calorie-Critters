import { z } from "zod";
import { ACTIVITY_LEVELS, GOALS, SEX_OPTIONS, UNIT_SYSTEMS } from "../constants";

export const upsertProfileSchema = z.object({
  height: z.number().positive().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  sex: z.enum(SEX_OPTIONS).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  activityLevel: z.enum(ACTIVITY_LEVELS).optional().nullable(),
  goal: z.enum(GOALS).optional().nullable(),
  calorieTarget: z.number().int().positive().optional().nullable(),
  proteinTarget: z.number().int().nonnegative().optional().nullable(),
  carbTarget: z.number().int().nonnegative().optional().nullable(),
  fatTarget: z.number().int().nonnegative().optional().nullable(),
  unitSystem: z.enum(UNIT_SYSTEMS).optional(),
});

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
