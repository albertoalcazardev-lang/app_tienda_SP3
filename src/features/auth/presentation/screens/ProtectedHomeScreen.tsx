import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

import type { UserRole } from '../../domain/entities/UserRole';
import { LogoutButton } from '../components/LogoutButton';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { useLogout } from '../hooks/useLogout';
import { useSession } from '../hooks/useSession';

const roleLabels: Record<UserRole, string> = {
  administrator: 'Administrador',
  auditor: 'Auditor',
  client: 'Cliente',
};

export function ProtectedHomeScreen() {
  const { session } = useSession();
  const logout = useLogout();

  if (!session) {
    return null;
  }

  const roleLabel = roleLabels[session.user.role];
  const userInitial = session.user.displayName.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View accessibilityLabel="Mercado" style={styles.brandBlock}>
              <View style={styles.logoMark}>
                <Text style={styles.logoLetter}>m</Text>
              </View>
              <Text style={styles.brandName}>mercado</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{roleLabel}</Text>
            </View>
          </View>

          <Text accessibilityRole="header" style={styles.title}>
            Mi cuenta
          </Text>

          <View style={styles.accountCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial || 'M'}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text numberOfLines={2} style={styles.displayName}>
                {session.user.displayName}
              </Text>
              <View style={styles.inlineRoleChip}>
                <Text style={styles.inlineRoleText}>{roleLabel}</Text>
              </View>
            </View>
            <Text style={styles.activeSession}>Sesión activa</Text>
          </View>

          <Text style={styles.helper}>
            Al salir se vaciará cualquier información privada conservada en
            memoria y la sesión almacenada en este dispositivo.
          </Text>

          <LogoutButton
            disabled={logout.isLoggingOut}
            onPress={logout.requestLogout}
          />
        </ScrollView>

        <View accessibilityLabel="Navegación principal" style={styles.navBar}>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>▦</Text>
            <Text style={styles.navText}>Catálogo</Text>
          </View>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>▣</Text>
            <Text style={styles.navText}>Carrito</Text>
          </View>
          <View style={[styles.navItem, styles.navItemSelected]}>
            <Text style={[styles.navIcon, styles.navTextSelected]}>○</Text>
            <Text style={[styles.navText, styles.navTextSelected]}>Cuenta</Text>
          </View>
        </View>
      </View>

      <LogoutConfirmation
        error={logout.error}
        isLoading={logout.isLoggingOut}
        isVisible={logout.isConfirmationVisible}
        onCancel={logout.cancelLogout}
        onConfirm={() => void logout.confirmLogout()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: colors.white,
    fontSize: 21,
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 18,
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
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '500',
  },
  accountCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
    minWidth: 150,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'right',
  },
  inlineRoleChip: {
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  inlineRoleText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  activeSession: {
    width: '100%',
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.label,
    lineHeight: 20,
  },
  navBar: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  navItem: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: radii.sm,
  },
  navItemSelected: {
    backgroundColor: colors.primarySoft,
  },
  navIcon: {
    color: colors.textPrimary,
    fontSize: 17,
  },
  navText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
  },
  navTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
