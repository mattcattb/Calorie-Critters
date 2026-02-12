import { zValidator } from "@hono/zod-validator";
import { createRouter } from "../common/hono";
import {
  createFoodItemSchema,
  searchOpenFoodFactsQuerySchema,
  updateFoodItemSchema,
} from "./foods.schema";
import {
  createFoodItem,
  deleteFoodItem,
  getFoodItem,
  listFoodItems,
  updateFoodItem,
} from "./foods.service";
import { searchOpenFoodFacts } from "../lib/open-food-facts";
import { NotFoundException } from "../common/errors";

export const foodsController = createRouter()
  .get("/", async (c) => {
    const search = c.req.query("search");
    const items = await listFoodItems(c.get("userId"), search);
    return c.json(items);
  })
  .post("/", zValidator("json", createFoodItemSchema), async (c) => {
    const data = c.req.valid("json");
    const item = await createFoodItem(c.get("userId"), data);
    return c.json(item, 201);
  })
  .get(
    "/open-food-facts/search",
    zValidator("query", searchOpenFoodFactsQuerySchema),
    async (c) => {
      const { query, page, pageSize } = c.req.valid("query");
      const results = await searchOpenFoodFacts(query, page, pageSize);
      return c.json(results);
    },
  )
  .get("/:id", async (c) => {
    const item = await getFoodItem(c.req.param("id"), c.get("userId"));
    if (!item) throw new NotFoundException("Food item not found");
    return c.json(item);
  })
  .put("/:id", zValidator("json", updateFoodItemSchema), async (c) => {
    const data = c.req.valid("json");
    const item = await updateFoodItem(
      c.req.param("id"),
      c.get("userId"),
      data,
    );
    if (!item) throw new NotFoundException("Food item not found");
    return c.json(item);
  })
  .delete("/:id", async (c) => {
    const item = await deleteFoodItem(c.req.param("id"), c.get("userId"));
    if (!item) throw new NotFoundException("Food item not found");
    return c.json({ success: true });
  });
