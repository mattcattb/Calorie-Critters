import { zValidator } from "@hono/zod-validator";
import { createRouter } from "../common/hono";
import { updateProfileSchema } from "./onboarding.schema";
import { onboardingService } from "./onboarding.service";

export const onboardingController = createRouter()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const profile = await onboardingService.getProfile(userId);
    return c.json(profile);
  })
  .put("/", zValidator("json", updateProfileSchema), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const profile = await onboardingService.updateProfile(userId, body);
    return c.json(profile);
  });
