import type { Cart } from '../entities/Cart';

export interface CartRepository {
  getCarts(): Promise<Cart[]>;
}