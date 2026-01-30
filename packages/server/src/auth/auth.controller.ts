import { Hono } from "hono";
import { auth } from "./auth.config";

/**
 * Auth controller that handles all Better Auth routes.
 * Better Auth handles: sign-up, sign-in, sign-out, session management, etc.
 *
 * Routes handled by Better Auth:
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - GET  /api/auth/session
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password
 * - And more depending on enabled features
 */
export const authController = new Hono()
  .all("/*", (c) => {
    return auth.handler(c.req.raw);
  });

// Re-export auth for use in other modules
export { auth };
