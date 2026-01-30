import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

export const sqlite = SQLite.openDatabase("nicotine.db");
export const db = drizzle(sqlite);

export const initDb = () =>
  new Promise<void>((resolve, reject) => {
    sqlite.transaction(
      (tx) => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS nicotine_entry (id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL DEFAULT 1, nicotine_mg REAL NOT NULL, cost REAL, product_id TEXT, timestamp INTEGER NOT NULL, notes TEXT, synced_at INTEGER)"
        );
      },
      (error) => reject(error),
      () => resolve()
    );
  });
