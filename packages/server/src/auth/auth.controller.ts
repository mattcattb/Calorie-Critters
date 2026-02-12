import {createRouter} from "../common/hono";
import {logger} from "../common/logger";
import {auth} from "../lib/auth";

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
export const authController = createRouter().all("/*", (c) => {
  const requestMeta = {
    method: c.req.method,
    path: c.req.path,
    origin: c.req.header("origin") ?? null,
    host: c.req.header("host") ?? null,
    forwardedHost: c.req.header("x-forwarded-host") ?? null,
    forwardedProto: c.req.header("x-forwarded-proto") ?? null,
  };

  return auth
    .handler(c.req.raw)
    .then((response) => {
      if (response.status >= 400) {
        logger.warn(
          {
            auth: {
              ...requestMeta,
              status: response.status,
            },
          },
          "Auth request returned non-2xx status",
        );
      }
      return response;
    })
    .catch((error) => {
      logger.error(
        {
          auth: requestMeta,
          err: error,
        },
        "Auth request failed",
      );
      throw error;
    });
});

// Re-export auth for use in other modules
export {auth};
