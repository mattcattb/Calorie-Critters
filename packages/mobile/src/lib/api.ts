import { createApiClient } from "api-client";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  includeCredentials: false,
});

export type ApiClient = typeof api;
