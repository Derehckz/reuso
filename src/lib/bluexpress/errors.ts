export class BluexpressError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(
    message: string,
    code = "BLUEXPRESS_ERROR",
    status?: number,
  ) {
    super(message);
    this.name = "BluexpressError";
    this.code = code;
    this.status = status;
  }
}

export function toBluexpressError(error: unknown): BluexpressError {
  if (error instanceof BluexpressError) return error;

  if (error instanceof Error) {
    return new BluexpressError(error.message, "BLUEXPRESS_UNKNOWN");
  }

  return new BluexpressError("Error desconocido de Bluexpress");
}
