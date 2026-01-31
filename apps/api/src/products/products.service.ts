import { eq, and, desc } from "drizzle-orm";
import { NotFoundException } from "../common/errors";
import { db } from "../db";
import { nicotineEntry, product } from "../db/schema";
import type { CreateProductInput, UpdateProductInput } from "./products.schema";

export const productsService = {
  async getAll(userId: string) {
    return db.select().from(product).where(eq(product.userId, userId));
  },

  async getLastUsed(userId: string) {
    const [last] = await db
      .select({
        product,
        lastUsedAt: nicotineEntry.timestamp,
      })
      .from(nicotineEntry)
      .innerJoin(product, eq(product.id, nicotineEntry.productId))
      .where(eq(nicotineEntry.userId, userId))
      .orderBy(desc(nicotineEntry.timestamp))
      .limit(1);

    return last ?? null;
  },

  async getById(userId: string, id: string) {
    const [prod] = await db
      .select()
      .from(product)
      .where(and(eq(product.id, id), eq(product.userId, userId)));
    if (!prod) {
      throw new NotFoundException("Product not found");
    }
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
      await db
        .update(product)
        .set({ isDefault: false })
        .where(and(eq(product.userId, userId), eq(product.type, existing.type)));
    }

    const [prod] = await db
      .update(product)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(product.id, id), eq(product.userId, userId)))
      .returning();

    if (!prod) {
      throw new NotFoundException("Product not found");
    }
    return prod;
  },

  async delete(userId: string, id: string) {
    const deleted = await db
      .delete(product)
      .where(and(eq(product.id, id), eq(product.userId, userId)))
      .returning({ id: product.id });
    if (deleted.length === 0) {
      throw new NotFoundException("Product not found");
    }
  },
};
