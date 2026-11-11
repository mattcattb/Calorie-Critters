import { z } from "zod";

export {
  createEntrySchema,
  updateEntrySchema,
  type CreateEntryInput,
  type UpdateEntryInput,
} from "@calorie-critters/shared/schemas";

export const listEntriesQuerySchema = z
  .object({
    date: z.string().date().optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  })
  .refine(
    ({ date, from, to }) =>
      Boolean(date) || (!from && !to) || Boolean(from && to),
    { message: "Provide either date or both from and to" },
  );

export const entrySummaryQuerySchema = z.object({
  date: z.string().date().optional(),
});
