import type { ProductRepository } from '../repositories/ProductRepository';
import type { InventoryAccess } from '../services/InventoryAccess';
import type { ProductFormValues } from '../entities/Product';
import { toProductInput } from '../validation/productValidation';
export class CreateProduct {
  constructor(
    private readonly repository: ProductRepository,
    private readonly access: InventoryAccess,
  ) {}
  async execute(values: ProductFormValues) {
    await this.access.requireAdministrator();
    return this.repository.create(toProductInput(values));
  }
}
