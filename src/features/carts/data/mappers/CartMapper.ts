import type { Cart, CartItem } from '../../domain/entities/Cart';
import type { CartDto, CartItemDto } from '../dto/CartDto';

export class CartMapper {
  static toDomain(dto: CartDto): Cart {
    return {
      id: dto.id,
      userId: dto.userId,
      date: dto.date,
      items: dto.products.map(mapItem),
    };
  }
}

function mapItem(dto: CartItemDto): CartItem {
  return {
    productId: dto.productId,
    quantity: dto.quantity,
  };
}