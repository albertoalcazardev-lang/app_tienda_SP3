export interface CartItemDto {
  readonly productId: number;
  readonly quantity: number;
}

export interface CartDto {
  readonly id: number;
  readonly userId: number;
  readonly date: string;
  readonly products: readonly CartItemDto[];
}