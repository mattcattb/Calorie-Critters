import { z } from "zod";

export const createCheckoutSchema = z.object({
  priceId: z.string().optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
