import {appEnv} from "./common/env";
import {logger} from "./common/logger";
import {addErrorHandling} from "./common/errors";
import {addGlobalMiddlewares, createRouter} from "./common/hono";

import {authController} from "./auth/auth.controller";
import {authMiddleware} from "./auth/auth.middleware";

import {entriesController} from "./entries/entries.controller";
import {productsController} from "./products/products.controller";
import {goalsController} from "./goals/goals.controller";
import {billingController, billingWebhook} from "./billing/billing.controller";
import {insightsController} from "./insights/insights.controller";
import {onboardingController} from "./onboarding/onboarding.controller";

const app = createRouter();
addGlobalMiddlewares(app);
addErrorHandling(app);

app.route("/api/auth", authController);

app.route("/api/webhooks/stripe", billingWebhook);

const api = createRouter()
  .use("*", authMiddleware)
  .route("/entries", entriesController)
  .route("/products", productsController)
  .route("/goals", goalsController)
  .route("/billing", billingController)
  .route("/onboarding", onboardingController)
  .route("/insights", insightsController);

app.route("/api", api);

export type AppType = typeof api;

const port = appEnv.PORT;
logger.info(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
