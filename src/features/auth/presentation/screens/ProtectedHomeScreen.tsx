import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

import type { UserRole } from '../../domain/entities/UserRole';
import { useSession } from '../hooks/useSession';

const roleLabels: Record<UserRole, string> = {
  administrator: 'Administrador',
  auditor: 'Auditor',
  client: 'Cliente',
};

export function ProtectedHomeScreen() {
  const { session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>m</Text>
            </View>
            <Text style={styles.brandName}>mercado</Text>
          </View>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>
              {roleLabels[session.user.role]}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Sesión iniciada
          </Text>
          <Text style={styles.message}>
            Hola, {session.user.displayName}. Tu perfil fue asignado como{' '}
            {roleLabels[session.user.role]}.
          </Text>
          <Text style={styles.helper}>
            La pantalla principal del catálogo se incorporará en su historia de
            usuario correspondiente.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: colors.white,
    fontSize: 27,
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '600',
  },
  roleChip: {
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roleChipText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  message: {
    color: colors.textPrimary,
    fontSize: typography.body,
    lineHeight: 24,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.label,
    lineHeight: 21,
  },
});
