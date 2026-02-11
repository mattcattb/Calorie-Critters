import { z } from "zod";

export const createEntrySchema = z.object({
  foodItemId: z.string().uuid(),
  servings: z.number().positive().default(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  loggedAt: z.string(), // YYYY-MM-DD
  notes: z.string().max(500).optional().nullable(),
});

export const updateEntrySchema = createEntrySchema.partial();

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
