import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { productsService } from "./products.service";
import { createProductSchema, updateProductSchema } from "./products.schema";

export const productsController = new Hono()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const products = await productsService.getAll(userId);
    return c.json(products);
  })
  .get("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const prod = await productsService.getById(userId, id);
    if (!prod) {
      return c.json({ error: "Product not found" }, 404);
    }
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
    if (!prod) {
      return c.json({ error: "Product not found" }, 404);
    }
    return c.json(prod);
  })
  .delete("/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    await productsService.delete(userId, id);
    return c.json({ success: true });
  });
