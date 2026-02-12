import {appEnv} from "./env";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];
const DEFAULT_TRUSTED_ORIGINS = [
  ...DEFAULT_ALLOWED_ORIGINS,
  "https://*.up.railway.app",
];

export const parseOrigins = (origins: string | undefined): string[] => {
  if (!origins) return [];
  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const configuredCorsOrigins = parseOrigins(appEnv.CORS_ORIGINS);
const configuredTrustedOrigins = parseOrigins(appEnv.BETTER_AUTH_TRUSTED_ORIGINS);

export const ALLOWED_ORIGINS =
  configuredCorsOrigins.length > 0 ? configuredCorsOrigins : DEFAULT_ALLOWED_ORIGINS;

export const TRUSTED_ORIGINS =
  configuredTrustedOrigins.length > 0
    ? configuredTrustedOrigins
    : [...new Set([...ALLOWED_ORIGINS, ...DEFAULT_TRUSTED_ORIGINS])];

export const isCorsAllowAllEnabled = appEnv.CORS_ALLOW_ALL;
