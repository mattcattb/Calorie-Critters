import { zValidator } from "@hono/zod-validator";
import { productsService } from "./products.service";
import { createProductSchema, updateProductSchema } from "./products.schema";
import { createRouter } from "../common/hono";

export const productsController = createRouter()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const products = await productsService.getAll(userId);
    return c.json(products);
  })
  .get("/last-used", async (c) => {
    const userId = c.get("userId");
    const product = await productsService.getLastUsed(userId);
    return c.json(product);
  })
  .get("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const prod = await productsService.getById(userId, id);
    return c.json(prod);
  })
  .post("/", zValidator("json", createProductSchema), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const prod = await productsService.create(userId, body);
    return c.json(prod, 201);
  })
  .put("/:id", zValidator("json", updateProductSchema), async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const prod = await productsService.update(userId, id, body);
    return c.json(prod);
  })
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    await productsService.delete(userId, id);
    return c.json({ success: true });
  });
