import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/shared/components/AppButton';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

import type { CartItem } from '../../domain/entities/Cart';
import { useCarts } from '../hooks/useCarts';

interface CartDetailScreenProps {
  readonly cartId: number;
}

export function CartDetailScreen({ cartId }: CartDetailScreenProps) {
  const { carts, isLoading, error, reload } = useCarts();
  const router = useRouter();

  if (isLoading) {
    return <LoadingIndicator label="Cargando carrito" />;
  }

  if (error !== null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No pudimos cargar historial de carritos</Text>
          <ErrorMessage message={error} />
          <AppButton
            accessibilityLabel="Reintentar"
            onPress={reload}
            title="Reintentar"
          />
        </View>
      </SafeAreaView>
    );
  }

  const cart = carts.find((item) => item.id === cartId);

  if (cart === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Carrito no encontrado</Text>
          <AppButton
            accessibilityLabel="Volver al historial"
            onPress={() => router.back()}
            title="Volver al historial"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text
          accessibilityLabel="Volver al historial"
          accessibilityRole="link"
          onPress={() => router.back()}
          style={styles.backLink}
        >
          ← Volver al historial
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          Carrito #{cart.id}
        </Text>
        <Text style={styles.subtitle}>
          {cart.date} · Usuario #{cart.userId}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Solo consulta · Sin acciones de modificación</Text>
        </View>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={cart.items}
        keyExtractor={(item) => String(item.productId)}
        renderItem={({ item }) => <ItemRow item={item} />}
      />
    </SafeAreaView>
  );
}

function ItemRow({ item }: { readonly item: CartItem }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>Producto #{item.productId}</Text>
      <View style={styles.itemQuantityRow}>
        <Text style={styles.itemQuantityLabel}>Cantidad</Text>
        <Text style={styles.itemQuantityValue}>{item.quantity} unidades</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    padding: spacing.lg,
  },
  backLink: {
    color: colors.primary,
    fontSize: typography.label,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.label,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 999,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.primary,
    fontSize: typography.label,
    fontWeight: '600',
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: spacing.xs,
    padding: spacing.md,
  },
  itemName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  itemQuantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQuantityLabel: {
    color: colors.textMuted,
    fontSize: typography.label,
  },
  itemQuantityValue: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: '600',
  },

    errorTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
});