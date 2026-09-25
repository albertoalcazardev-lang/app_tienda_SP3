import type { Product, ProductInput } from '../entities/Product';
export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product>;
  create(input: ProductInput): Promise<Product>;
  update(id: number, input: ProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
}
