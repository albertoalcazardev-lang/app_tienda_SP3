import type { Cart } from '../entities/Cart';
import type { CartRepository } from '../repositories/CartRepository';

export class GetCarts {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(): Promise<Cart[]> {
    return this.cartRepository.getCarts();
  }
}