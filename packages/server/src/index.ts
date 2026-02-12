import {appEnv} from "./common/env";
import {logger} from "./common/logger";
import {addErrorHandling} from "./common/errors";
import {addGlobalMiddlewares, createRouter} from "./common/hono";
import {ALLOWED_ORIGINS, TRUSTED_ORIGINS, isCorsAllowAllEnabled} from "./common/origins";

import {authController} from "./auth/auth.controller";
import {authMiddleware} from "./auth/auth.middleware";

import {profileController} from "./profile/profile.controller";
import {foodsController} from "./foods/foods.controller";
import {entriesController} from "./entries/entries.controller";
import {petsController} from "./pets/pets.controller";

const app = createRouter();
addGlobalMiddlewares(app);
addErrorHandling(app);

process.on("unhandledRejection", (reason) => {
  logger.error({reason}, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({err: error}, "Uncaught exception");
});

app.route("/api/auth", authController);

const api = createRouter()
  .use("*", authMiddleware)
  .route("/profile", profileController)
  .route("/foods", foodsController)
  .route("/entries", entriesController)
  .route("/pets", petsController);

app.route("/api", api);

export type AppType = typeof api;

const port = appEnv.PORT;
if (!appEnv.CORS_ORIGINS && appEnv.NODE_ENV === "production") {
  logger.warn(
    "CORS_ORIGINS is not set in production. Requests may be blocked by CORS.",
  );
}

if (appEnv.CORS_ORIGINS?.includes("${{")) {
  logger.warn(
    {rawCorsOrigins: appEnv.CORS_ORIGINS},
    "CORS_ORIGINS appears unresolved (contains template syntax).",
  );
}

if (appEnv.BETTER_AUTH_URL.includes("${{")) {
  logger.warn(
    {rawBetterAuthUrl: appEnv.BETTER_AUTH_URL},
    "BETTER_AUTH_URL appears unresolved (contains template syntax).",
  );
}

logger.info(
  {
    port,
    nodeEnv: appEnv.NODE_ENV ?? null,
    betterAuthUrl: appEnv.BETTER_AUTH_URL,
    corsAllowAll: isCorsAllowAllEnabled,
    allowedCorsOrigins: ALLOWED_ORIGINS,
    betterAuthTrustedOrigins: TRUSTED_ORIGINS,
  },
  "Server configuration loaded",
);

export default {
  port,
  fetch: app.fetch,
};
