import { useRef, useState } from 'react';
import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';
import type { Product, ProductFormValues } from '../../domain/entities/Product';
import { validateProduct } from '../../domain/validation/productValidation';
import type { ProductErrors } from '../../domain/validation/productValidation';
const emptyValues: ProductFormValues = {
  title: '',
  price: '',
  description: '',
  image: '',
  category: '',
};
export function useProductEditor(product?: Product) {
  const { inventory } = useDependencies();
  const [values, setValues] = useState<ProductFormValues>(
    product
      ? {
          title: product.title,
          price: String(product.price),
          description: product.description,
          image: product.image,
          category: product.category,
        }
      : emptyValues,
  );
  const [errors, setErrors] = useState<ProductErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  function change(field: keyof ProductFormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }
  async function save(): Promise<Product | null> {
    if (busy.current) return null;
    const validation = validateProduct(values);
    setErrors(validation);
    setError(null);
    if (Object.keys(validation).length) return null;
    busy.current = true;
    setSaving(true);
    try {
      const saved = product
        ? await inventory.updateProduct.execute(product.id, values)
        : await inventory.createProduct.execute(values);
      if (!product) setValues({ ...emptyValues });
      return saved;
    } catch (caught: unknown) {
      setError(toAppError(caught, 'No fue posible guardar el producto.').message);
      return null;
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return { values, errors, error, saving, change, save };
}
