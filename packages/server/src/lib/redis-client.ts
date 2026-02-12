import { createClient } from "redis";
import { appEnv } from "../common/env";
import { logger } from "../common/logger";

const REDIS_CONNECT_RETRY_COOLDOWN_MS = 30000;

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let connectPromise: Promise<RedisClient | null> | null = null;
let lastConnectFailureAt = 0;

export async function connectRedisClient(): Promise<RedisClient | null> {
  if (!appEnv.REDIS_URL) return null;

  if (redisClient?.isOpen) {
    return redisClient;
  }

  const now = Date.now();
  if (
    lastConnectFailureAt > 0 &&
    now - lastConnectFailureAt < REDIS_CONNECT_RETRY_COOLDOWN_MS
  ) {
    return null;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const nextClient = createClient({
    url: appEnv.REDIS_URL,
    socket: {
      connectTimeout: appEnv.REDIS_CONNECT_TIMEOUT_MS,
    },
  });

  nextClient.on("error", (error) => {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      "Redis client error",
    );
  });

  connectPromise = nextClient
    .connect()
    .then(() => {
      redisClient = nextClient;
      return nextClient;
    })
    .catch((error) => {
      lastConnectFailureAt = Date.now();
      logger.warn(
        { error: error instanceof Error ? error.message : String(error) },
        "Redis unavailable. Falling back to in-memory cache only",
      );
      try {
        nextClient.disconnect();
      } catch {
        // ignore disconnect errors from failed connection attempts
      }
      return null;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}
