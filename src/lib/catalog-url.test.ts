import { describe, expect, it } from "vitest";
import { parseCatalogParams } from "./catalog-url";

describe("parseCatalogParams", () => {
  it("ignores NaN price filters", () => {
    const filters = parseCatalogParams({
      minPrice: "abc",
      maxPrice: "NaN",
      page: "x",
    });
    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBeUndefined();
    expect(filters.page).toBe(1);
  });

  it("parses valid numeric filters", () => {
    const filters = parseCatalogParams({
      minPrice: "1000",
      maxPrice: "50000",
      page: "3",
    });
    expect(filters.minPrice).toBe(1000);
    expect(filters.maxPrice).toBe(50000);
    expect(filters.page).toBe(3);
  });
});
