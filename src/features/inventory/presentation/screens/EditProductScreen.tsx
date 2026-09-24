import { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDependencies } from '@/app/di/useDependencies';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';
import { ProductEditor } from '../components/ProductEditor';
import { InventoryLayout } from '../components/InventoryLayout';
import { useProductQuery } from '../hooks/useProductQuery';
export function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inventory } = useDependencies();
  const router = useRouter();
  const query = useProductQuery(
    useCallback(() => inventory.getProduct.execute(Number(id)), [id, inventory]),
  );
  if (query.loading) return <LoadingIndicator label="Cargando datos actuales" />;
  if (query.error || !query.data)
    return (
      <InventoryLayout title="Editar producto">
        <ErrorMessage message={query.error} />
        <AppButton
          title="Reintentar"
          accessibilityLabel="Reintentar edición"
          onPress={query.retry}
        />
        <AppButton
          title="Volver al catálogo"
          accessibilityLabel="Volver al catálogo"
          onPress={() => router.replace('/(main)/inventory')}
        />
      </InventoryLayout>
    );
  return <ProductEditor key={query.data.id} product={query.data} />;
}
