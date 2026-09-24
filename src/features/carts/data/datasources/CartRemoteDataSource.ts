import { AppError } from '@/shared/errors/AppError';

import type { HttpClient } from '@/shared/http/HttpClient';
import type { CartDto } from '../dto/CartDto';

export interface CartRemoteDataSourceContract {
  getCarts(): Promise<CartDto[]>;
}

export class CartRemoteDataSource implements CartRemoteDataSourceContract {
  constructor(private readonly httpClient: HttpClient) {}

  async getCarts(): Promise<CartDto[]> {
    const payload = await this.httpClient.get<unknown>('/carts');
    if (!isCartDtoArray(payload)) {
      throw new AppError(
        'La respuesta del historial de carritos no es válida.',
        'INVALID_RESPONSE',
      );
    }
    return payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCartItemDto(value: unknown): value is CartDto['products'][number] {
  return (
    isRecord(value) &&
    typeof value.productId === 'number' &&
    typeof value.quantity === 'number'
  );
}

function isCartDto(value: unknown): value is CartDto {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.userId === 'number' &&
    typeof value.date === 'string' &&
    Array.isArray(value.products) &&
    value.products.every(isCartItemDto)
  );
}

function isCartDtoArray(value: unknown): value is CartDto[] {
  return Array.isArray(value) && value.every(isCartDto);
}