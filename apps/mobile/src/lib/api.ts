import { createApiClient } from "api-client";

const API_BASE_URL =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.EXPO_PUBLIC_API_URL ?? "";

export const api = createApiClient<any>({
  baseUrl: API_BASE_URL,
  includeCredentials: false,
});

export type ApiClient = typeof api;
