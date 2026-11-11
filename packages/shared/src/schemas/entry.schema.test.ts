import { describe, expect, test } from "bun:test";
import { createEntrySchema } from "./entry.schema";

const validEntry = {
  foodItemId: "2c349e34-772b-4604-bb45-8adcc9e53cd3",
  servings: 1,
  mealType: "lunch" as const,
  loggedAt: "2026-07-23",
};

describe("createEntrySchema", () => {
  test("accepts a calendar date", () => {
    expect(createEntrySchema.parse(validEntry).loggedAt).toBe("2026-07-23");
  });

  test("rejects impossible and non-calendar dates", () => {
    expect(() =>
      createEntrySchema.parse({ ...validEntry, loggedAt: "2026-02-30" }),
    ).toThrow();
    expect(() =>
      createEntrySchema.parse({ ...validEntry, loggedAt: "tomorrow" }),
    ).toThrow();
  });
});
