import { z } from "zod";

export const createFoodItemSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(200).optional().nullable(),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1).max(20),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export const updateFoodItemSchema = createFoodItemSchema.partial();

export type CreateFoodItemInput = z.infer<typeof createFoodItemSchema>;
export type UpdateFoodItemInput = z.infer<typeof updateFoodItemSchema>;
