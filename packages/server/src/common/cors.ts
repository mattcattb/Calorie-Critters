import { cors } from "hono/cors";

import {ALLOWED_ORIGINS, isCorsAllowAllEnabled} from "./origins";

const resolveCorsOrigin = (origin: string) => {
  if (!origin) return "";
  if (isCorsAllowAllEnabled) return origin;
  return ALLOWED_ORIGINS.includes(origin) ? origin : "";
};

export const corsMiddleware = cors({
  origin: resolveCorsOrigin,
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400, // 24 hours
});
