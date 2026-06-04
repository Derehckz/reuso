import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createOrderAccessToken,
  verifyOrderAccessToken,
} from "@/lib/order-access-token";

describe("order-access-token", () => {
  const prev = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.AUTH_SECRET = "test-secret-for-vitest-min-32-chars!!";
  });

  afterEach(() => {
    process.env.AUTH_SECRET = prev;
  });

  it("crea y verifica token válido", () => {
    const token = createOrderAccessToken("RU-250101-ABC123", "cliente@reuso.cl");
    const result = verifyOrderAccessToken(token, "RU-250101-ABC123");
    expect(result.valid).toBe(true);
    expect(result.email).toBe("cliente@reuso.cl");
  });

  it("rechaza número de pedido distinto", () => {
    const token = createOrderAccessToken("RU-250101-ABC123", "a@b.cl");
    const result = verifyOrderAccessToken(token, "RU-OTHER");
    expect(result.valid).toBe(false);
  });
});
