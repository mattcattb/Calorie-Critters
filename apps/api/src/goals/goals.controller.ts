import {zValidator} from "@hono/zod-validator";
import {goalsService} from "./goals.service";
import {createGoalSchema, updateGoalSchema} from "@nicflow/shared";
import {createRouter} from "../common/hono";

export const goalsController = createRouter()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const goals = await goalsService.getAll(userId);
    return c.json(goals);
  })
  .get("/active", async (c) => {
    const userId = c.get("userId");
    const goals = await goalsService.getActive(userId);
    return c.json(goals);
  })
  .get("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const g = await goalsService.getById(userId, id);
    return c.json(g);
  })
  .get("/:id/progress", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const progress = await goalsService.getProgress(userId, id);
    return c.json(progress);
  })
  .post("/", zValidator("json", createGoalSchema), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const g = await goalsService.create(userId, body);
    return c.json(g, 201);
  })
  .put("/:id", zValidator("json", updateGoalSchema), async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const g = await goalsService.update(userId, id, body);
    return c.json(g);
  })
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    await goalsService.delete(userId, id);
    return c.json({success: true});
  });
