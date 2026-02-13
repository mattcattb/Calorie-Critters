import {addErrorHandling} from "./common/errors";
import {addGlobalMiddlewares, createRouter} from "./common/hono";

import {addAuthController} from "./auth/auth.controller";
import {authMiddleware} from "./auth/auth.middleware";

import {profileController} from "./profile/profile.controller";
import {foodsController} from "./foods/foods.controller";
import {entriesController} from "./entries/entries.controller";
import {petsController} from "./pets/pets.controller";

export const app = createRouter();
addGlobalMiddlewares(app);
addErrorHandling(app);

addAuthController(app);

export const appRoutes = app
  .basePath("/api")
  .use("*", authMiddleware)
  .route("/profile", profileController)
  .route("/foods", foodsController)
  .route("/entries", entriesController)
  .route("/pets", petsController);

export type AppType = typeof appRoutes;
