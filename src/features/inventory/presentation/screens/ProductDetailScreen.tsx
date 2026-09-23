import { useCallback } from 'react';
import { Image, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDependencies } from '@/app/di/useDependencies';
import { useSession } from '@/features/auth/presentation/hooks/useSession';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';
import {
  InventoryLayout,
  inventoryStyles as styles,
} from '../components/InventoryLayout';
import { useProductQuery } from '../hooks/useProductQuery';
import { useDeleteProduct } from '../hooks/useDeleteProduct';
export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inventory } = useDependencies();
  const { user } = useSession();
  const router = useRouter();
  const query = useProductQuery(
    useCallback(() => inventory.getProduct.execute(Number(id)), [id, inventory]),
  );
  const deletion = useDeleteProduct(Number(id), () =>
    router.replace({ pathname: '/(main)/inventory', params: { deleted: String(id) } }),
  );
  const product = query.data;
  return (
    <InventoryLayout title="Detalle del producto">
      {query.loading ? (
        <LoadingIndicator label="Cargando producto" />
      ) : query.error ? (
        <>
          <ErrorMessage message={query.error} />
          <AppButton
            title="Reintentar"
            accessibilityLabel="Reintentar producto"
            onPress={query.retry}
          />
        </>
      ) : (
        product && (
          <>
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              accessibilityLabel={product.title}
            />
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.body}>{product.category}</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <Text style={styles.body}>{product.description}</Text>
            {user?.role === 'admin' && (
              <>
                <AppButton
                  title="Editar"
                  accessibilityLabel="Editar producto"
                  disabled={deletion.deleting}
                  onPress={() =>
                    router.push({
                      pathname: '/(main)/inventory/[id]/edit',
                      params: { id: String(product.id) },
                    })
                  }
                />
                <AppButton
                  title="Eliminar"
                  accessibilityLabel="Eliminar producto"
                  loading={deletion.deleting}
                  onPress={deletion.confirmDelete}
                />
              </>
            )}
            <ErrorMessage message={deletion.error} />
          </>
        )
      )}
      <AppButton
        title="Volver al catálogo"
        accessibilityLabel="Volver al catálogo"
        disabled={deletion.deleting}
        onPress={() => router.replace('/(main)/inventory')}
      />
    </InventoryLayout>
  );
}
