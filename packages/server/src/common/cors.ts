import { cors } from "hono/cors";

const resolveCorsOrigin = (origin: string) => origin || "*";

export const corsMiddleware = cors({
  origin: resolveCorsOrigin,
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400, // 24 hours
});
