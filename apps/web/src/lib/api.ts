import {createApiClient} from "@nicflow/api-client";
import type {AppType} from "@nicflow/api/src/index";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE_URL = rawBaseUrl.startsWith("http")
  ? rawBaseUrl
  : `http://${rawBaseUrl}`;

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
export const api = createApiClient<AppType>({
  baseUrl: API_BASE_URL,
  includeCredentials: true,
});

export type ApiClient = typeof api;
