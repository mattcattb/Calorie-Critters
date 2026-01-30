import { createApiClient } from "api-client";

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
export const api = createApiClient({ baseUrl: API_BASE_URL });

export type ApiClient = typeof api;
