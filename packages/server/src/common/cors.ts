import { cors } from "hono/cors";

import {appEnv} from "./env";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

const parseOrigins = (origins: string | undefined): string[] => {
  if (!origins) return [];
  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const configuredOrigins = parseOrigins(appEnv.CORS_ORIGINS);

export const ALLOWED_ORIGINS =
  configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;

export const corsMiddleware = cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400, // 24 hours
});
