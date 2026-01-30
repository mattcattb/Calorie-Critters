import {z} from "zod";

const appEnvSchema = z.object({
  DATABASE_URL: z.string(),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),

  PORT: z.number().default(3000),
});

export const appEnv = appEnvSchema.parse(process.env);
