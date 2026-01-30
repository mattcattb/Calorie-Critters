import { db } from "../db";
import { product } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { CreateProductInput, UpdateProductInput } from "./products.schema";

export const productsService = {
  async getAll(userId: string) {
    return db.select().from(product).where(eq(product.userId, userId));
  },

  async getById(userId: string, id: string) {
    const [prod] = await db
      .select()
      .from(product)
      .where(and(eq(product.id, id), eq(product.userId, userId)));
    return prod;
  },

  async create(userId: string, input: CreateProductInput) {
    // If setting as default, unset other defaults of same type
    if (input.isDefault) {
      await db
        .update(product)
        .set({ isDefault: false })
        .where(and(eq(product.userId, userId), eq(product.type, input.type)));
    }

    const [prod] = await db
      .insert(product)
      .values({
        userId,
        name: input.name,
        type: input.type,
        nicotineMg: input.nicotineMg,
        costPerUnit: input.costPerUnit,
        isDefault: input.isDefault,
      })
      .returning();

    return prod;
  },

  async update(userId: string, id: string, input: UpdateProductInput) {
    // If setting as default, unset other defaults of same type
    if (input.isDefault) {
      const existing = await this.getById(userId, id);
      if (existing) {
        await db
          .update(product)
          .set({ isDefault: false })
          .where(and(eq(product.userId, userId), eq(product.type, existing.type)));
      }
    }

    const [prod] = await db
      .update(product)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(product.id, id), eq(product.userId, userId)))
      .returning();

    return prod;
  },

  async delete(userId: string, id: string) {
    await db
      .delete(product)
      .where(and(eq(product.id, id), eq(product.userId, userId)));
  },
};
