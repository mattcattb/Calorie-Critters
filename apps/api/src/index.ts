import {Hono} from "hono";
import {logger as honoLogger} from "hono/logger";

// Common
import {corsMiddleware} from "./common/cors";
import {logger} from "./common/logger";

// Auth
import {authController} from "./auth/auth.controller";
import {authMiddleware} from "./auth/auth.middleware";

// Feature controllers
import {entriesController} from "./entries/entries.controller";
import {productsController} from "./products/products.controller";
import {goalsController} from "./goals/goals.controller";
import {billingController, billingWebhook} from "./billing/billing.controller";

const app = new Hono();

app.use("*", honoLogger());
app.use("*", corsMiddleware);

app.get("/health", (c) =>
  c.json({status: "ok", timestamp: new Date().toISOString()}),
);

app.route("/api/auth", authController);

app.route("/api/webhooks/stripe", billingWebhook);

const api = new Hono()
  .use("*", authMiddleware)
  .route("/entries", entriesController)
  .route("/products", productsController)
  .route("/goals", goalsController)
  .route("/billing", billingController);

app.route("/api", api);

export type AppType = typeof api;

const port = process.env.PORT || 3000;
logger.info(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
