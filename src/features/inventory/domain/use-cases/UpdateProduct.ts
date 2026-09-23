import type { ProductRepository } from '../repositories/ProductRepository';
import type { InventoryAccess } from '../services/InventoryAccess';
import type { ProductFormValues } from '../entities/Product';
import { toProductInput, assertProductId } from '../validation/productValidation';
export class UpdateProduct {
  constructor(
    private readonly repository: ProductRepository,
    private readonly access: InventoryAccess,
  ) {}
  async execute(id: number, values: ProductFormValues) {
    await this.access.requireAdministrator();
    assertProductId(id);
    return this.repository.update(id, toProductInput(values));
  }
}
