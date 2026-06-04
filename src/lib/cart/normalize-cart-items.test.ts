import { describe, expect, it } from "vitest";
import { normalizeCartItems } from "./normalize-cart-items";

describe("normalizeCartItems", () => {
  const base = {
    productId: "clh3b0f8f0000qzym002k9x7a",
    variantId: "clh3b0f8f0000qzym002k9x7b",
    quantity: 2,
  };

  it("merges duplicate variant lines", () => {
    const result = normalizeCartItems([
      { ...base, quantity: 2 },
      { ...base, quantity: 3 },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.quantity).toBe(5);
    }
  });

  it("caps merged quantity at 10", () => {
    const result = normalizeCartItems([
      { ...base, quantity: 8 },
      { ...base, quantity: 5 },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.items[0]?.quantity).toBe(10);
    }
  });

  it("rejects inconsistent productId for same variant", () => {
    const result = normalizeCartItems([
      base,
      {
        ...base,
        productId: "clh3b0f8f0000qzym002k9x7c",
        quantity: 1,
      },
    ]);
    expect(result.success).toBe(false);
  });
});
