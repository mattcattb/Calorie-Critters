import {appEnv} from "./common/env";
import {logger} from "./common/logger";
import {addErrorHandling} from "./common/errors";
import {addGlobalMiddlewares, createRouter} from "./common/hono";

import {authController} from "./auth/auth.controller";
import {authMiddleware} from "./auth/auth.middleware";

import {profileController} from "./profile/profile.controller";
import {foodsController} from "./foods/foods.controller";
import {entriesController} from "./entries/entries.controller";
import {petsController} from "./pets/pets.controller";

const app = createRouter();
addGlobalMiddlewares(app);
addErrorHandling(app);

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
logger.info(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
