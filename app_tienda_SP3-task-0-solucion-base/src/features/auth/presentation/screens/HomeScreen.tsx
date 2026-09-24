import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/shared/components/AppButton';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { toAppError } from '@/shared/errors/AppError';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

import { useSession } from '../hooks/useSession';

export function HomeScreen() {
  const router = useRouter();
  const { user, logout, isLoggingOut, error: sessionError } = useSession();
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (caught: unknown) {
      setError(toAppError(caught, 'No fue posible cerrar sesión.').message);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Hola, {user?.name ?? 'usuario'}
          </Text>
          <Text style={styles.body}>
            La autenticación se ejecutó a través de un caso de uso inyectado.
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <ErrorMessage message={error ?? sessionError} />
          <AppButton
            accessibilityLabel="Cerrar sesión"
            loading={isLoggingOut}
            onPress={() => {
              void handleLogout();
            }}
            title="Cerrar sesión"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  email: {
    color: colors.primary,
    fontSize: typography.label,
    fontWeight: '600',
  },
});
