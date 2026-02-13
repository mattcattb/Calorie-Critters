import {hc} from "hono/client";
import {type AppType} from "@calorie-critters/server/rpc";
import type {
  CreateEntryInput,
  CreateFoodItemInput,
  RecordPetEventInput,
  UpdateFoodItemInput,
  UpdateUserPetInput,
  UpsertProfileInput,
} from "@calorie-critters/shared";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const API_BASE_URL = rawBaseUrl.startsWith("http")
  ? rawBaseUrl
  : `http://${rawBaseUrl}`;

const client = hc<AppType>(API_BASE_URL, {
  init: {
    credentials: "include",
  },
});

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed";
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body: {
        error?: {message?: string};
        message?: string;
      } = (await response.json()) as
        | {error?: {message?: string}}
        | {message?: string};
      message = body.error?.message ?? body.message ?? message;
    } else {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const honoClient = {
  profile: {
    get: async <T>() => parseResponse<T>(await client.api.profile.$get()),
    update: async <T>(json: UpsertProfileInput) =>
      parseResponse<T>(await client.api.profile.$put({json})),
  },
  entries: {
    list: async <T>(query: {date?: string; from?: string; to?: string}) =>
      parseResponse<T>(await client.api.entries.$get({query})),
    summary: async <T>(date: string) =>
      parseResponse<T>(await client.api.entries.summary.$get({query: {date}})),
    create: async <T>(json: CreateEntryInput) =>
      parseResponse<T>(await client.api.entries.$post({json})),
  },
  foods: {
    list: async <T>(search?: string) =>
      parseResponse<T>(
        await client.api.foods.$get({
          query: search ? {search} : {},
        }),
      ),
    create: async <T>(json: CreateFoodItemInput) =>
      parseResponse<T>(await client.api.foods.$post({json})),
    update: async <T>(id: string, json: UpdateFoodItemInput) =>
      parseResponse<T>(await client.api.foods[":id"].$put({param: {id}, json})),
    remove: async <T>(id: string) =>
      parseResponse<T>(await client.api.foods[":id"].$delete({param: {id}})),
    searchOpenFoodFacts: async <T>(query: string, page = 1, pageSize = 10) =>
      parseResponse<T>(
        await client.api.foods["open-food-facts"].search.$get({
          query: {query, page: String(page), pageSize: String(pageSize)},
        }),
      ),
  },
  pets: {
    me: async <T>() => parseResponse<T>(await client.api.pets.me.$get()),
    updateMe: async <T>(json: UpdateUserPetInput) =>
      parseResponse<T>(await client.api.pets.me.$patch({json})),
    recordEvent: async <T>(json: RecordPetEventInput) =>
      parseResponse<T>(await client.api.pets.me.events.$post({json})),
  },
};
