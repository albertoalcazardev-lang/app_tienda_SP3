import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
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

export function HomeScreen() {
  const { session } = useSession();
  const logout = useLogout();
  if (!session) return null;
  const role = roleLabels[session.user.role];
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>mercado</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          Mi cuenta
        </Text>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {session.user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{session.user.displayName}</Text>
            <Text style={styles.username}>@{session.user.username}</Text>
            <Text style={styles.active}>Sesión activa · {role}</Text>
          </View>
        </View>
        <Text style={styles.helper}>
          Al salir se eliminarán el token y los datos privados de sesión guardados en este
          dispositivo.
        </Text>
        <LogoutButton disabled={logout.isLoggingOut} onPress={logout.requestLogout} />
      </ScrollView>
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: colors.primary, fontSize: typography.heading, fontWeight: '800' },
  role: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.small,
    fontWeight: '700',
  },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  avatarText: { color: colors.primary, fontSize: typography.heading, fontWeight: '800' },
  info: { flex: 1, gap: spacing.xs },
  name: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  username: { color: colors.textMuted },
  active: { color: colors.success, fontSize: typography.small, fontWeight: '600' },
  helper: { color: colors.textMuted, lineHeight: 22 },
});
