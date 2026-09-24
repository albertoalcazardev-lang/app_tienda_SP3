export interface CartItem {
  readonly productId: number;
  readonly quantity: number;
}

export interface Cart {
  readonly id: number;
  readonly userId: number;
  readonly date: string;
  readonly items: readonly CartItem[];
}