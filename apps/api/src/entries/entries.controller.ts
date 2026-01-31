import {zValidator} from "@hono/zod-validator";
import {entriesService} from "./entries.service";
import {createEntrySchema, updateEntrySchema} from "./entries.schema";
import {createRouter} from "../common/hono";

export const entriesController = createRouter()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const entries = await entriesService.getAll(userId);
    return c.json(entries);
  })
  .post("/", zValidator("json", createEntrySchema), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const entry = await entriesService.create(userId, body);
    return c.json(entry, 201);
  })
  .put("/:id", zValidator("json", updateEntrySchema), async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const entry = await entriesService.update(userId, id, body);
    return c.json(entry);
  })
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    await entriesService.delete(userId, id);
    return c.json({success: true});
  })
  .get("/stats", async (c) => {
    const userId = c.get("userId");
    const stats = await entriesService.getStats(userId);
    return c.json(stats);
  })
  .get("/cost-stats", async (c) => {
    const userId = c.get("userId");
    const stats = await entriesService.getCostStats(userId);
    return c.json(stats);
  });
