import { describe, expect, it } from "vitest";
import {
  canTransitionOrderStatus,
  validateAdminOrderTransition,
} from "@/lib/order-status-transitions";

describe("order status transitions", () => {
  it("allows AWAITING_PAYMENT to PAID", () => {
    expect(canTransitionOrderStatus("AWAITING_PAYMENT", "PAID")).toBe(true);
  });

  it("blocks CANCELLED on paid order", () => {
    expect(validateAdminOrderTransition("PAID", "CANCELLED")).toMatch(
      /Reembolsado/i,
    );
  });

  it("blocks REFUNDED on unpaid order", () => {
    expect(validateAdminOrderTransition("AWAITING_PAYMENT", "REFUNDED")).toMatch(
      /no fue pagado/i,
    );
  });
});
