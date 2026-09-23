import type { ProductRepository } from '../repositories/ProductRepository';
import type { InventoryAccess } from '../services/InventoryAccess';
import { assertProductId } from '../validation/productValidation';
export class DeleteProduct {
  constructor(
    private readonly repository: ProductRepository,
    private readonly access: InventoryAccess,
  ) {}
  async execute(id: number) {
    await this.access.requireAdministrator();
    assertProductId(id);
    return this.repository.delete(id);
  }
}
