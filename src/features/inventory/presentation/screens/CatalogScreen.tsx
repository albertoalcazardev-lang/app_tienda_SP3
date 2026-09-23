import { useCallback, useEffect } from 'react';
import { Image, Text, View } from 'react-native';
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
export function CatalogScreen() {
  const { inventory } = useDependencies();
  const { user } = useSession();
  const router = useRouter();
  const { deleted } = useLocalSearchParams<{ deleted?: string }>();
  const notice = Boolean(deleted);
  useEffect(() => {
    if (!deleted) return;
    const timer = setTimeout(() => {
      router.setParams({ deleted: undefined });
    }, 5000);
    return () => clearTimeout(timer);
  }, [deleted, router]);
  const query = useProductQuery(
    useCallback(() => inventory.listProducts.execute(), [inventory]),
  );
  return (
    <InventoryLayout title="Catálogo de productos">
      {notice && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.success}
        >
          Producto eliminado (Simulación)
        </Text>
      )}
      <Text style={styles.body}>
        Las operaciones son simuladas. Los productos creados no aparecen en el catálogo y
        los eliminados pueden volver a aparecer al consultar.
      </Text>
      {user?.role === 'admin' && (
        <AppButton
          title="Agregar producto"
          accessibilityLabel="Agregar producto"
          onPress={() => router.push('/(main)/inventory/create')}
        />
      )}
      <AppButton
        title="Mi cuenta"
        accessibilityLabel="Mi cuenta"
        onPress={() => router.replace('/(main)')}
      />
      {query.loading ? (
        <LoadingIndicator label="Cargando catálogo" />
      ) : query.error ? (
        <>
          <ErrorMessage message={query.error} />
          <AppButton
            title="Reintentar"
            accessibilityLabel="Reintentar catálogo"
            onPress={query.retry}
          />
        </>
      ) : (
        <>
          {query.data?.length === 0 && (
            <Text style={styles.body}>No hay productos disponibles.</Text>
          )}
          {query.data?.map((product) => (
            <View key={product.id} style={styles.card}>
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                accessibilityLabel={product.title}
              />
              <Text style={styles.title}>{product.title}</Text>
              <Text style={styles.body}>{product.category}</Text>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <AppButton
                title="Ver producto"
                accessibilityLabel={`Ver ${product.title}`}
                onPress={() =>
                  router.push({
                    pathname: '/(main)/inventory/[id]',
                    params: { id: String(product.id) },
                  })
                }
              />
            </View>
          ))}
        </>
      )}
    </InventoryLayout>
  );
}
