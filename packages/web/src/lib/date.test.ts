import { describe, expect, test } from "bun:test";
import { localDateKey } from "./date";

describe("localDateKey", () => {
  test("formats the user's local calendar day", () => {
    expect(localDateKey(new Date(2026, 0, 2, 23, 30))).toBe("2026-01-02");
  });
});
