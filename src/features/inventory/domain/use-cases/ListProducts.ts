import type { ProductRepository } from '../repositories/ProductRepository';
export class ListProducts {
  constructor(private readonly repository: ProductRepository) {}
  async execute() {
    return this.repository.getAll();
  }
}
