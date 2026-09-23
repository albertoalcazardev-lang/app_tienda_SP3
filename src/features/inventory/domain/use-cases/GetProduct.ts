import type { ProductRepository } from '../repositories/ProductRepository';
import { assertProductId } from '../validation/productValidation';
export class GetProduct {
  constructor(private readonly repository: ProductRepository) {}
  async execute(id: number) {
    assertProductId(id);
    return this.repository.getById(id);
  }
}
