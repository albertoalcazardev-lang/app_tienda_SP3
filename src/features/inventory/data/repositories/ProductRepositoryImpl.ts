import type { Product, ProductInput } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { ProductDataSource } from '../datasources/ProductRemoteDataSource';
export class ProductRepositoryImpl implements ProductRepository {
  // Fake Store no persiste cambios: solo retenemos ediciones en esta ejecución.
  private readonly edits = new Map<number, Product>();
  constructor(private readonly remote: ProductDataSource) {}
  async getAll(): Promise<Product[]> {
    const products = await this.remote.getAll();
    return products.map((product) => this.edits.get(product.id) ?? product);
  }
  async getById(id: number): Promise<Product> {
    return this.edits.get(id) ?? this.remote.getById(id);
  }
  create(input: ProductInput): Promise<Product> {
    return this.remote.create(input);
  }
  async update(id: number, input: ProductInput): Promise<Product> {
    const product = await this.remote.update(id, input);
    this.edits.set(id, product);
    return product;
  }
  async delete(id: number): Promise<void> {
    await this.remote.delete(id);
    this.edits.delete(id);
  }
}
