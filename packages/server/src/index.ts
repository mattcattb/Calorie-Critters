import {appEnv} from "./common/env";
import {logger} from "./common/logger";
import {
  ALLOWED_ORIGINS,
  TRUSTED_ORIGINS,
  isCorsAllowAllEnabled,
} from "./common/origins";

import {app} from "./app";

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
