export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(
    message: string,
    code: AppErrorCode = "INTERNAL",
    status = 500,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }

  static unauthorized(message = "No autorizado") {
    return new AppError(message, "UNAUTHORIZED", 401);
  }

  static forbidden(message = "Acceso denegado") {
    return new AppError(message, "FORBIDDEN", 403);
  }

  static notFound(message = "No encontrado") {
    return new AppError(message, "NOT_FOUND", 404);
  }

  static validation(message: string) {
    return new AppError(message, "VALIDATION", 400);
  }
}

export function toActionMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado";
}
