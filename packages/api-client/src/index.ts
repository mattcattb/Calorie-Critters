import { hc } from "hono/client";
import type { AppType } from "server/src/index";

export type ApiClient = ReturnType<typeof createApiClient>;

export type ApiClientOptions = {
  baseUrl?: string;
  includeCredentials?: boolean;
  getAuthToken?: () => string | null | Promise<string | null>;
  headers?: HeadersInit;
};

export const createApiClient = ({
  baseUrl = "",
  includeCredentials = true,
  getAuthToken,
  headers,
}: ApiClientOptions = {}) =>
  hc<AppType>(`${baseUrl}/api`, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = getAuthToken ? await getAuthToken() : null;
      const nextHeaders = new Headers(init?.headers ?? {});

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          if (value !== undefined) nextHeaders.set(key, String(value));
        }
      }

      if (token) {
        nextHeaders.set("Authorization", `Bearer ${token}`);
      }

      return fetch(input, {
        ...init,
        credentials: includeCredentials ? "include" : "omit",
        headers: nextHeaders,
      });
    },
  });
