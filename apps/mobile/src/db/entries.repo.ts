import { desc, eq, isNull } from "drizzle-orm";
import type { CreateEntryInput } from "@nicflow/shared";
import { db } from "./client";
import { nicotineEntry } from "./schema";

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const listEntries = async () =>
  db.select().from(nicotineEntry).orderBy(desc(nicotineEntry.timestamp));

export const listUnsyncedEntries = async () =>
  db.select().from(nicotineEntry).where(isNull(nicotineEntry.syncedAt));

export const insertEntry = async (input: CreateEntryInput) => {
  const id = createId();
  const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();

  await db.insert(nicotineEntry).values({
    id,
    type: input.type,
    amount: input.amount,
    nicotineMg: input.nicotineMg,
    cost: input.cost ?? null,
    productId: input.productId ?? null,
    timestamp,
    notes: input.notes ?? null,
    syncedAt: null,
  });

  return id;
};

export const markEntrySynced = async (id: string) => {
  await db
    .update(nicotineEntry)
    .set({ syncedAt: new Date() })
    .where(eq(nicotineEntry.id, id));
};
