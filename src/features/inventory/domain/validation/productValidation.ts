import { AppError } from '@/shared/errors/AppError';
import type { ProductFormValues, ProductInput } from '../entities/Product';
export type ProductErrors = Partial<Record<keyof ProductFormValues, string>>;
export function validateProduct(values: ProductFormValues): ProductErrors {
  const errors: ProductErrors = {};
  for (const key of ['title', 'description', 'category'] as const) {
    if (!values[key].trim()) errors[key] = 'Este campo es obligatorio.';
  }
  const price = values.price.trim();
  if (
    !/^\d+(\.\d+)?$/.test(price) ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0
  ) {
    errors.price = 'Ingresa un precio numérico mayor que cero.';
  }
  try {
    const url = new URL(values.image.trim());
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
  } catch {
    errors.image = 'Ingresa una URL de imagen HTTP o HTTPS válida.';
  }
  return errors;
}
export function toProductInput(values: ProductFormValues): ProductInput {
  if (Object.keys(validateProduct(values)).length) {
    throw new AppError('Revisa los campos del producto.', 'VALIDATION_ERROR');
  }
  return {
    title: values.title.trim(),
    price: Number(values.price),
    description: values.description.trim(),
    image: values.image.trim(),
    category: values.category.trim(),
  };
}
export function assertProductId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new AppError('El producto no es válido.', 'VALIDATION_ERROR');
}
