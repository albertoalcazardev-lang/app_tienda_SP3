export type AppErrorCode =
  | 'invalid-credentials'
  | 'offline'
  | 'invalid-response'
  | 'secure-storage'
  | 'session-expired'
  | 'timeout'
  | 'unexpected';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
