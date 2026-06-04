export class MercadoPagoError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(
    message: string,
    code = "MERCADOPAGO_ERROR",
    options?: { status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "MercadoPagoError";
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

export function toMercadoPagoError(error: unknown): MercadoPagoError {
  if (error instanceof MercadoPagoError) return error;

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "MERCADOPAGO_NOT_CONFIGURED"
  ) {
    return new MercadoPagoError(
      error instanceof Error ? error.message : "MercadoPago no configurado",
      "MERCADOPAGO_NOT_CONFIGURED",
      { cause: error },
    );
  }

  if (error && typeof error === "object") {
    const err = error as {
      message?: string;
      status?: number;
      cause?: { message?: string; status?: number };
      api_response?: { content?: string; status?: number };
    };

    const status = err.status ?? err.cause?.status ?? err.api_response?.status;
    const apiContent = err.api_response?.content;
    let detail = err.message ?? err.cause?.message ?? "Error de MercadoPago";

    if (apiContent) {
      try {
        const parsed = JSON.parse(apiContent) as {
          message?: string;
          error?: string;
          cause?: Array<{ code?: string; description?: string }>;
        };
        detail =
          parsed.cause?.map((c) => c.description).filter(Boolean).join(". ") ||
          parsed.message ||
          parsed.error ||
          detail;
      } catch {
        detail = apiContent;
      }
    }

    return new MercadoPagoError(detail, "MERCADOPAGO_API_ERROR", {
      status,
      cause: error,
    });
  }

  return new MercadoPagoError(
    error instanceof Error ? error.message : "Error desconocido de MercadoPago",
    "MERCADOPAGO_UNKNOWN",
    { cause: error },
  );
}

export function getMercadoPagoUserMessage(error: unknown): string {
  const mp = toMercadoPagoError(error);
  if (mp.code === "MERCADOPAGO_NOT_CONFIGURED") {
    return "El pago en línea no está disponible en este momento.";
  }
  if (mp.status === 401 || mp.status === 403) {
    return "Error de configuración del medio de pago. Contacta a soporte.";
  }
  return mp.message;
}
