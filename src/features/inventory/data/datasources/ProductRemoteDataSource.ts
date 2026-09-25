import { AppError } from '@/shared/errors/AppError';
import type { MutationHttpClient } from '@/shared/http/MutationHttpClient';
import type { Product, ProductInput } from '../../domain/entities/Product';
import type { InventoryAccess } from '../../domain/services/InventoryAccess';
import { assertProductId } from '../../domain/validation/productValidation';
export interface ProductDataSource {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product>;
  create(input: ProductInput): Promise<Product>;
  update(id: number, input: ProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
}
// La autorización se vuelve a comprobar justo antes de cada escritura HTTP.
export class ProductRemoteDataSource implements ProductDataSource {
  constructor(
    private readonly http: MutationHttpClient,
    private readonly access: InventoryAccess,
  ) {}
  async getAll(): Promise<Product[]> {
    const payload = await this.http.get<unknown>('/products');
    if (!Array.isArray(payload)) throw invalidResponse();
    return payload.map(parseProduct);
  }
  async getById(id: number): Promise<Product> {
    assertProductId(id);
    return parseProduct(await this.http.get<unknown>(`/products/${id}`));
  }
  async create(input: ProductInput): Promise<Product> {
    await this.access.requireAdministrator();
    return parseProduct(await this.http.post<unknown, ProductInput>('/products', input));
  }
  async update(id: number, input: ProductInput): Promise<Product> {
    assertProductId(id);
    await this.access.requireAdministrator();
    const product = parseProduct(
      await this.http.put<unknown, ProductInput>(`/products/${id}`, input),
    );
    if (product.id !== id) throw invalidResponse();
    return product;
  }
  async delete(id: number): Promise<void> {
    assertProductId(id);
    await this.access.requireAdministrator();
    const product = parseProduct(await this.http.delete<unknown>(`/products/${id}`));
    if (product.id !== id) throw invalidResponse();
  }
}
function invalidResponse(): AppError {
  return new AppError('El servidor devolvió un producto no válido.', 'INVALID_RESPONSE');
}
function parseProduct(value: unknown): Product {
  if (typeof value !== 'object' || value === null) throw invalidResponse();
  const p = value as Record<string, unknown>;
  if (
    typeof p.id !== 'number' ||
    !Number.isSafeInteger(p.id) ||
    p.id <= 0 ||
    typeof p.price !== 'number' ||
    !Number.isFinite(p.price) ||
    p.price < 0 ||
    typeof p.title !== 'string' ||
    typeof p.description !== 'string' ||
    typeof p.image !== 'string' ||
    typeof p.category !== 'string'
  )
    throw invalidResponse();
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    description: p.description,
    image: p.image,
    category: p.category,
  };
}
