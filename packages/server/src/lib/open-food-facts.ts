import { z } from "zod";
import { appEnv } from "../common/env";
import { ServiceException } from "../common/errors";
import { connectRedisClient } from "./redis-client";

const openFoodFactsNutrimentsSchema = z.record(
  z.union([z.number(), z.string(), z.null()]),
);

const openFoodFactsProductSchema = z.object({
  code: z.string().optional(),
  product_name: z.string().optional(),
  product_name_en: z.string().optional(),
  brands: z.string().optional(),
  serving_size: z.string().optional(),
  nutriments: openFoodFactsNutrimentsSchema.optional(),
});

const openFoodFactsSearchResponseSchema = z.object({
  count: z.union([z.number(), z.string()]).optional(),
  page: z.union([z.number(), z.string()]).optional(),
  page_size: z.union([z.number(), z.string()]).optional(),
  products: z.array(openFoodFactsProductSchema).default([]),
});

export const openFoodFactsFoodSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().nullable(),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  source: z.literal("open_food_facts"),
});

export type OpenFoodFactsFoodResult = z.infer<typeof openFoodFactsFoodSchema>;

export const openFoodFactsSearchResultSchema = z.object({
  count: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  items: z.array(openFoodFactsFoodSchema),
});

export type OpenFoodFactsSearchResult = z.infer<
  typeof openFoodFactsSearchResultSchema
>;

type OpenFoodFactsProduct = z.infer<typeof openFoodFactsProductSchema>;

type CacheEntry = {
  expiresAt: number;
  value: OpenFoodFactsSearchResult;
};

const DEFAULT_USER_AGENT =
  "CalorieCritters/0.1.0 (https://github.com/matthewboughton/calorie-critters)";

const SERVING_UNIT_PATTERN =
  /(\d+(?:[.,]\d+)?)\s*(g|gram|grams|ml|milliliter|milliliters|oz|ounce|ounces|kg|kilogram|kilograms|l|liter|liters|serving|servings|piece|pieces|slice|slices|cup|cups|tbsp|tsp|fl oz)\b/i;

const SUPPORTED_100G_CONVERSION_UNITS = new Set([
  "g",
  "gram",
  "grams",
  "ml",
  "milliliter",
  "milliliters",
]);

const UNIT_ALIASES: Record<string, string> = {
  gram: "g",
  grams: "g",
  milliliter: "ml",
  milliliters: "ml",
  ounce: "oz",
  ounces: "oz",
  kilogram: "kg",
  kilograms: "kg",
  liter: "l",
  liters: "l",
  servings: "serving",
  pieces: "piece",
  slices: "slice",
  cups: "cup",
};

const openFoodFactsCache = new Map<string, CacheEntry>();
const REDIS_CACHE_KEY_PREFIX = "open_food_facts:search";

function cacheIdentity(query: string, page: number, pageSize: number): string {
  return `${query.trim().toLowerCase()}::${page}::${pageSize}`;
}

function memoryCacheRead(
  query: string,
  page: number,
  pageSize: number,
): OpenFoodFactsSearchResult | null {
  const key = cacheIdentity(query, page, pageSize);
  const cached = openFoodFactsCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    openFoodFactsCache.delete(key);
    return null;
  }

  return cached.value;
}

function memoryCacheWrite(
  query: string,
  page: number,
  pageSize: number,
  value: OpenFoodFactsSearchResult,
): void {
  const key = cacheIdentity(query, page, pageSize);
  const expiresAt = Date.now() + appEnv.OPEN_FOOD_FACTS_CACHE_TTL_MS;

  if (openFoodFactsCache.size >= appEnv.OPEN_FOOD_FACTS_CACHE_MAX_ENTRIES) {
    const oldestKey = openFoodFactsCache.keys().next().value;
    if (oldestKey) {
      openFoodFactsCache.delete(oldestKey);
    }
  }

  openFoodFactsCache.set(key, { expiresAt, value });
}

function redisCacheKey(query: string, page: number, pageSize: number): string {
  return `${REDIS_CACHE_KEY_PREFIX}:${cacheIdentity(query, page, pageSize)}`;
}

async function readCache(
  query: string,
  page: number,
  pageSize: number,
): Promise<OpenFoodFactsSearchResult | null> {
  const fromMemory = memoryCacheRead(query, page, pageSize);
  if (fromMemory) {
    return fromMemory;
  }

  const client = await connectRedisClient();
  if (!client) {
    return null;
  }

  let payload: string | null = null;
  try {
    payload = await client.get(redisCacheKey(query, page, pageSize));
  } catch {
    return null;
  }
  if (!payload) {
    return null;
  }

  try {
    const parsed = openFoodFactsSearchResultSchema.parse(
      JSON.parse(payload) as unknown,
    );
    memoryCacheWrite(query, page, pageSize, parsed);
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(
  query: string,
  page: number,
  pageSize: number,
  value: OpenFoodFactsSearchResult,
): Promise<void> {
  memoryCacheWrite(query, page, pageSize, value);

  const ttlSeconds = Math.max(
    1,
    Math.ceil(appEnv.OPEN_FOOD_FACTS_CACHE_TTL_MS / 1000),
  );

  const client = await connectRedisClient();
  if (!client) {
    return;
  }

  try {
    await client.set(redisCacheKey(query, page, pageSize), JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch {
    // ignore Redis write errors and rely on in-memory cache/API fallback
  }
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toNonNegative(value: number | null): number {
  if (value === null || Number.isNaN(value) || value < 0) return 0;
  return value;
}

function parseServing(
  raw: string | null | undefined,
): { value: number; unit: string } | null {
  if (!raw) return null;

  const match = raw.toLowerCase().match(SERVING_UNIT_PATTERN);
  if (!match) return null;

  const value = parseNumber(match[1]);
  if (value === null || value <= 0) return null;

  const unitRaw = match[2];
  const unit = UNIT_ALIASES[unitRaw] ?? unitRaw;
  return { value, unit };
}

function multiplyPer100(value: number | null, servingAmount: number): number {
  if (value === null) return 0;
  return toNonNegative(value * (servingAmount / 100));
}

function mapProductToFoodResult(
  product: OpenFoodFactsProduct,
): OpenFoodFactsFoodResult | null {
  const code = product.code?.trim();
  if (!code) return null;

  const nutriments = product.nutriments ?? {};
  const serving = parseServing(product.serving_size);

  const caloriesServing = parseNumber(nutriments["energy-kcal_serving"]);
  const proteinServing = parseNumber(nutriments["proteins_serving"]);
  const carbsServing = parseNumber(nutriments["carbohydrates_serving"]);
  const fatServing = parseNumber(nutriments["fat_serving"]);

  const calories100g =
    parseNumber(nutriments["energy-kcal_100g"]) ??
    parseNumber(nutriments["energy-kcal"]);
  const protein100g =
    parseNumber(nutriments["proteins_100g"]) ??
    parseNumber(nutriments["proteins"]);
  const carbs100g =
    parseNumber(nutriments["carbohydrates_100g"]) ??
    parseNumber(nutriments["carbohydrates"]);
  const fat100g =
    parseNumber(nutriments["fat_100g"]) ?? parseNumber(nutriments["fat"]);

  let servingSize = 100;
  let servingUnit = "g";
  let calories = calories100g;
  let protein = protein100g;
  let carbs = carbs100g;
  let fat = fat100g;

  if (serving && serving.value > 0) {
    servingSize = serving.value;
    servingUnit = serving.unit;

    if (
      caloriesServing !== null ||
      proteinServing !== null ||
      carbsServing !== null ||
      fatServing !== null
    ) {
      calories = caloriesServing;
      protein = proteinServing;
      carbs = carbsServing;
      fat = fatServing;
    } else if (SUPPORTED_100G_CONVERSION_UNITS.has(servingUnit)) {
      calories = multiplyPer100(calories100g, servingSize);
      protein = multiplyPer100(protein100g, servingSize);
      carbs = multiplyPer100(carbs100g, servingSize);
      fat = multiplyPer100(fat100g, servingSize);
    }
  } else if (
    caloriesServing !== null ||
    proteinServing !== null ||
    carbsServing !== null ||
    fatServing !== null
  ) {
    servingSize = 1;
    servingUnit = "serving";
    calories = caloriesServing;
    protein = proteinServing;
    carbs = carbsServing;
    fat = fatServing;
  }

  const caloriesValue = toNonNegative(calories);
  const proteinValue = toNonNegative(protein);
  const carbsValue = toNonNegative(carbs);
  const fatValue = toNonNegative(fat);

  if (
    caloriesValue <= 0 &&
    proteinValue <= 0 &&
    carbsValue <= 0 &&
    fatValue <= 0
  ) {
    return null;
  }

  const mapped = {
    code,
    name:
      product.product_name?.trim() ||
      product.product_name_en?.trim() ||
      `Product ${code}`,
    brand: product.brands?.trim() || null,
    servingSize,
    servingUnit,
    calories: caloriesValue,
    protein: proteinValue,
    carbs: carbsValue,
    fat: fatValue,
    source: "open_food_facts" as const,
  };

  return openFoodFactsFoodSchema.parse(mapped);
}

export async function searchOpenFoodFacts(
  query: string,
  page: number,
  pageSize: number,
): Promise<OpenFoodFactsSearchResult> {
  const cached = await readCache(query, page, pageSize);
  if (cached) return cached;

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page: String(page),
    page_size: String(pageSize),
    fields:
      "code,product_name,product_name_en,brands,serving_size,nutriments",
  });

  const url = `${appEnv.OPEN_FOOD_FACTS_BASE_URL}/cgi/search.pl?${params.toString()}`;
  const userAgent = appEnv.OPEN_FOOD_FACTS_USER_AGENT || DEFAULT_USER_AGENT;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(appEnv.OPEN_FOOD_FACTS_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ServiceException("Open Food Facts request failed", {
      cause: error instanceof Error ? error.message : "unknown",
    });
  }

  if (!response.ok) {
    throw new ServiceException("Open Food Facts request failed", {
      status: response.status,
    });
  }

  const payload = openFoodFactsSearchResponseSchema.parse(
    (await response.json()) as unknown,
  );

  const items = payload.products
    .map(mapProductToFoodResult)
    .filter(
      (product): product is OpenFoodFactsFoodResult => product !== null,
    );

  const result = openFoodFactsSearchResultSchema.parse({
    count: Number(payload.count ?? 0),
    page: Number(payload.page ?? page),
    pageSize: Number(payload.page_size ?? pageSize),
    items,
  });

  await writeCache(query, page, pageSize, result);
  return result;
}
