import { createApiClient } from "api-client";
import type { AppType } from "api/src/index";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Type-safe API client using Hono RPC.
 * All routes are fully typed based on the server's AppType.
 *
 * Usage:
 *   const res = await api.entries.$get();
 *   const entries = await res.json();
 *
 *   const res = await api.entries.$post({ json: { type: "cigarette", nicotineMg: 1.2 } });
 */
export const api = createApiClient<AppType>({ baseUrl: API_BASE_URL });

export type ApiClient = typeof api;
