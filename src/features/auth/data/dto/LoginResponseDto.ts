import { AppError } from '@/shared/errors/AppError';

export interface LoginResponseDto {
  readonly token: string;
}

export function parseLoginResponse(value: unknown): LoginResponseDto {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('token' in value) ||
    typeof value.token !== 'string' ||
    value.token.trim().length === 0
  ) {
    throw new AppError(
      'invalid-response',
      'La respuesta de autenticación no contiene un token válido.',
    );
  }

  return { token: value.token };
}
