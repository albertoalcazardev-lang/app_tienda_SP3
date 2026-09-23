export interface ProductInput {
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly image: string;
  readonly category: string;
}
export interface Product extends ProductInput {
  readonly id: number;
}
export interface ProductFormValues {
  title: string;
  price: string;
  description: string;
  image: string;
  category: string;
}
