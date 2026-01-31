import { createClient } from "redis";
import { appEnv } from "../common/env";
import { logger } from "../common/logger";

export const redis = appEnv.REDIS_URL
  ? createClient({ url: appEnv.REDIS_URL })
  : null;

if (redis) {
  redis.on("error", (err) => {
    logger.error(`Redis error: ${err instanceof Error ? err.message : String(err)}`);
  });
}

export const connectRedis = async () => {
  if (!redis) return;
  if (!redis.isOpen) {
    await redis.connect();
  }
};

export const disconnectRedis = async () => {
  if (!redis) return;
  if (redis.isOpen) {
    await redis.disconnect();
  }
};
