import { zValidator } from "@hono/zod-validator";
import { createRouter } from "../common/hono";
import { createEntrySchema, updateEntrySchema } from "./entries.schema";
import {
  createEntry,
  deleteEntry,
  getDailySummary,
  listEntries,
  updateEntry,
} from "./entries.service";
import { NotFoundException } from "../common/errors";

export const entriesController = createRouter()
  .get("/", async (c) => {
    const date = c.req.query("date");
    const from = c.req.query("from");
    const to = c.req.query("to");
    const entries = await listEntries(c.get("userId"), { date, from, to });
    return c.json(entries);
  })
  .get("/summary", async (c) => {
    const date =
      c.req.query("date") ?? new Date().toISOString().split("T")[0];
    const summary = await getDailySummary(c.get("userId"), date);
    return c.json(summary);
  })
  .post("/", zValidator("json", createEntrySchema), async (c) => {
    const data = c.req.valid("json");
    const entry = await createEntry(c.get("userId"), data);
    return c.json(entry, 201);
  })
  .put("/:id", zValidator("json", updateEntrySchema), async (c) => {
    const data = c.req.valid("json");
    const entry = await updateEntry(c.req.param("id"), c.get("userId"), data);
    if (!entry) throw new NotFoundException("Entry not found");
    return c.json(entry);
  })
  .delete("/:id", async (c) => {
    const entry = await deleteEntry(c.req.param("id"), c.get("userId"));
    if (!entry) throw new NotFoundException("Entry not found");
    return c.json({ success: true });
  });
