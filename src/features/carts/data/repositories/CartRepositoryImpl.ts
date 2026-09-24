import type { Cart } from '../../domain/entities/Cart';
import type { CartRepository } from '../../domain/repositories/CartRepository';
import type { CartRemoteDataSourceContract } from '../datasources/CartRemoteDataSource';
import { CartMapper } from '../mappers/CartMapper';

export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly remoteDataSource: CartRemoteDataSourceContract) {}

  async getCarts(): Promise<Cart[]> {
    const dtos = await this.remoteDataSource.getCarts();
    return dtos.map(CartMapper.toDomain);
  }
}