import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const getEnv = (key: string) =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[key];

const SQLITE_NAME = getEnv("EXPO_PUBLIC_SQLITE_NAME") ?? "dose.dev.db";

export const sqlite = SQLite.openDatabaseSync(SQLITE_NAME);
export const db = drizzle(sqlite);

export const initDb = async () => {
  await sqlite.execAsync(
    "CREATE TABLE IF NOT EXISTS nicotine_entry (id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL DEFAULT 1, nicotine_mg REAL NOT NULL, cost REAL, product_id TEXT, timestamp INTEGER NOT NULL, notes TEXT, synced_at INTEGER)"
  );
};
