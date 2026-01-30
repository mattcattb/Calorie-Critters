import { api } from "../lib/api";
import { listUnsyncedEntries, markEntrySynced } from "../db/entries.repo";

export const syncUnsyncedEntries = async () => {
  const entries = await listUnsyncedEntries();
  if (entries.length === 0) return { synced: 0 };

  let synced = 0;

  for (const entry of entries) {
    try {
      const res = await api.entries.$post({
        json: {
          type: entry.type,
          amount: entry.amount,
          nicotineMg: entry.nicotineMg,
          cost: entry.cost ?? undefined,
          productId: entry.productId ?? undefined,
          timestamp: new Date(entry.timestamp).toISOString(),
          notes: entry.notes ?? undefined,
        },
      });

      if (!res.ok) {
        continue;
      }

      await markEntrySynced(entry.id);
      synced += 1;
    } catch (error) {
      // Network or auth failures should not block local usage.
      continue;
    }
  }

  return { synced };
};
