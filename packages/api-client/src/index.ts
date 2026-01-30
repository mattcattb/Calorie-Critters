import type { Hono } from "hono";
import { hc } from "hono/client";

export type ApiClientOptions = {
  baseUrl?: string;
  includeCredentials?: boolean;
  getAuthToken?: () => string | null | Promise<string | null>;
  headers?: HeadersInit;
};

export const createApiClient = <
  T extends Hono<any, any, any> = Hono<any, any, any>
>({
  baseUrl = "",
  includeCredentials = true,
  getAuthToken,
  headers,
}: ApiClientOptions = {}): ReturnType<typeof hc<T>> =>
  hc<T>(`${baseUrl}/api`, {
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
