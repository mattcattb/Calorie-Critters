import { zValidator } from "@hono/zod-validator";
import { createRouter } from "../common/hono";
import { recordPetEventSchema, updateUserPetSchema } from "./pets.schema";
import { getPetBundle, recordPetEvent, updatePetDetails } from "./pets.service";

export const petsController = createRouter()
  .get("/me", async (c) => {
    const pet = await getPetBundle(c.get("userId"));
    return c.json(pet);
  })
  .patch("/me", zValidator("json", updateUserPetSchema), async (c) => {
    const payload = c.req.valid("json");
    const pet = await updatePetDetails(c.get("userId"), payload);
    return c.json(pet);
  })
  .post("/me/events", zValidator("json", recordPetEventSchema), async (c) => {
    const payload = c.req.valid("json");
    const pet = await recordPetEvent(c.get("userId"), payload);
    return c.json(pet);
  });
