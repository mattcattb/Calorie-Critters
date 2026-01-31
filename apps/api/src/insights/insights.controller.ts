import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { createRouter } from "../common/hono";
import { insightsService } from "./insights.service";

const usageByHourQuery = z.object({
  days: z.string().optional(),
});

const usageByTypeQuery = z.object({
  days: z.string().optional(),
});

const levelSeriesQuery = z.object({
  hours: z.string().optional(),
  intervalMinutes: z.string().optional(),
});

export const insightsController = createRouter()
  .get("/usage-by-hour", zValidator("query", usageByHourQuery), async (c) => {
    const userId = c.get("userId");
    const { days } = c.req.valid("query");
    const parsedDays = days && !Number.isNaN(Number(days)) ? Number(days) : undefined;
    const data = await insightsService.getUsageByHour(userId, parsedDays);
    return c.json(data);
  })
  .get("/usage-by-type", zValidator("query", usageByTypeQuery), async (c) => {
    const userId = c.get("userId");
    const { days } = c.req.valid("query");
    const parsedDays = days && !Number.isNaN(Number(days)) ? Number(days) : undefined;
    const data = await insightsService.getUsageByType(userId, parsedDays);
    return c.json(data);
  })
  .get("/level-series", zValidator("query", levelSeriesQuery), async (c) => {
    const userId = c.get("userId");
    const { hours, intervalMinutes } = c.req.valid("query");
    const parsedHours = hours && !Number.isNaN(Number(hours)) ? Number(hours) : undefined;
    const parsedInterval =
      intervalMinutes && !Number.isNaN(Number(intervalMinutes))
        ? Number(intervalMinutes)
        : undefined;
    const data = await insightsService.getLevelSeries(
      userId,
      parsedHours,
      parsedInterval,
    );
    return c.json(data);
  });
