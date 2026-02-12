import {z} from "zod";

const betterAuthSchema = z.object({
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
});

const googleEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
});

const githubEnvSchema = z.object({
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

const appEnvSchema = z.object({
  ...betterAuthSchema.shape,
  ...googleEnvSchema.shape,
  ...githubEnvSchema.shape,
  DATABASE_URL: z.string(),

  LOG_LEVEL: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  CORS_ALLOW_ALL: z.preprocess((value) => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
    return value;
  }, z.boolean().default(false)),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),

  NODE_ENV: z.string().optional(),
  OPEN_FOOD_FACTS_BASE_URL: z
    .string()
    .url()
    .default("https://world.openfoodfacts.org"),
  OPEN_FOOD_FACTS_USER_AGENT: z.string().optional(),
  OPEN_FOOD_FACTS_TIMEOUT_MS: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().default(8000)),
  OPEN_FOOD_FACTS_CACHE_TTL_MS: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().default(86400000)),
  OPEN_FOOD_FACTS_CACHE_MAX_ENTRIES: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().default(500)),
  REDIS_URL: z.string().url().optional(),
  REDIS_CONNECT_TIMEOUT_MS: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().default(1000)),

  PORT: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().default(3000)),
});
const parsedEnv = appEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Environment validation failed:",
    JSON.stringify(parsedEnv.error.flatten(), null, 2),
  );
  throw new Error("Invalid environment configuration");
}

export const appEnv = parsedEnv.data;
