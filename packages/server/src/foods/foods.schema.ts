import { z } from "zod";

export {
  createFoodItemSchema,
  updateFoodItemSchema,
  type CreateFoodItemInput,
  type UpdateFoodItemInput,
} from "@calorie-critters/shared/schemas";

export const searchOpenFoodFactsQuerySchema = z.object({
  query: z.string().trim().min(2).max(120),
  page: z.coerce.number().int().min(1).max(20).default(1),
  pageSize: z.coerce.number().int().min(1).max(25).default(10),
});

export type SearchOpenFoodFactsQueryInput = z.infer<
  typeof searchOpenFoodFactsQuerySchema
>;
