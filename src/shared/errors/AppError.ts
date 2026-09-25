export type AppErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'CONFIG_ERROR'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'HTTP_ERROR'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  override readonly name = 'AppError';

  constructor(
    message: string,
    readonly code: AppErrorCode,
    readonly originalError?: unknown,
  ) {
    super(message);
  }
}

export function toAppError(
  error: unknown,
  fallbackMessage = 'Ocurrió un error inesperado.',
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(fallbackMessage, 'UNKNOWN_ERROR', error);
}
