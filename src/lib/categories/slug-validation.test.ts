import { describe, expect, it } from "vitest";
import {
  isReservedCategorySlug,
  normalizeCategorySlug,
  validateSlugFormat,
} from "@/lib/categories/slug-validation";

describe("slug-validation", () => {
  it("normalizes names to slugs", () => {
    expect(normalizeCategorySlug("", "Poleras Mujer")).toBe("poleras-mujer");
  });

  it("rejects reserved slugs", () => {
    expect(isReservedCategorySlug("admin")).toBe(true);
    expect(validateSlugFormat("admin")).toMatch(/reservado/i);
  });

  it("accepts valid slugs", () => {
    expect(validateSlugFormat("mujer-poleras")).toBeNull();
  });
});
