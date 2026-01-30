import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nicotineEntry = sqliteTable("nicotine_entry", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  amount: integer("amount").notNull().default(1),
  nicotineMg: real("nicotine_mg").notNull(),
  cost: real("cost"),
  productId: text("product_id"),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
  notes: text("notes"),
  syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
});
