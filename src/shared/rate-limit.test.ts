import { describe, it, expect } from "vitest";
import { rateLimit } from "@/shared/rate-limit";

describe("rateLimit", () => {
  it("permite hasta el límite", () => {
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});
