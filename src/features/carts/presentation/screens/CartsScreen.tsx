import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/shared/components/AppButton';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

import type { Cart } from '../../domain/entities/Cart';
import { useCarts } from '../hooks/useCarts';

export function CartsScreen() {
  const { carts, isLoading, error, reload } = useCarts();
  const router = useRouter();

  if (isLoading) {
    return <LoadingIndicator label="Cargando historial de carritos" />;
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Historial de carritos
        </Text>
        <Text style={styles.subtitle}>Actividad global · Solo lectura</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={carts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CartCard
            cart={item}
            onPress={() => router.push(`/(main)/carts/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

function CartCard({
  cart,
  onPress,
}: {
  readonly cart: Cart;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Ver carrito ${cart.id}`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.cardRow}>
        <Text style={styles.cartId}>Carrito #{cart.id}</Text>
        <Text style={styles.chevron}>→</Text>
      </View>
      <Text style={styles.meta}>
        {cart.date} · Usuario #{cart.userId}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {cart.items.length} productos distintos
        </Text>
      </View>
    </Pressable>
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
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.label,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartId: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  meta: {
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
  errorTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
});