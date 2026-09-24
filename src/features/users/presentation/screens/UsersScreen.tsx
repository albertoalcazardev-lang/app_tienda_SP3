import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/shared/components/AppButton';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

import type { User } from '../../domain/entities/User';
import { useUsers } from '../hooks/useUsers';

const ROLE_LABELS: Record<User['role'], string> = {
  admin: 'Administrador',
  auditor: 'Auditor',
  client: 'Cliente',
};

export function UsersScreen() {
  const { users, isLoading, error, reload } = useUsers();

  if (isLoading) {
    return <LoadingIndicator label="Cargando usuarios" />;
  }

    if (error !== null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No pudimos cargar usuarios</Text>
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
          Usuarios
        </Text>
        <Text style={styles.subtitle}>Directorio de cuentas · Solo lectura</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <UserCard user={item} />}
      />
    </SafeAreaView>
  );
}

function UserCard({ user }: { readonly user: User }) {
  const initials = getInitials(user.fullName);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.meta}>
            ID {user.id} · @{user.username}
          </Text>
        </View>
      </View>
      <Text style={styles.contact}>{user.email}</Text>
      <Text style={styles.contact}>{user.phone}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{ROLE_LABELS[user.role]}</Text>
      </View>
    </View>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
  return initials.join('') || '?';
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
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    color: colors.surface,
    fontSize: typography.label,
    fontWeight: '700',
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.label,
  },
  contact: {
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
  errorDetail: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
  },
});