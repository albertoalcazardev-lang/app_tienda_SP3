import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { useSession } from '../hooks/useSession';

export function LoginScreen() {
  const router = useRouter();
  const { notice } = useSession();
  const onSuccess = useCallback(() => router.replace('/(main)'), [router]);
  const { login, isLoading, error } = useLogin({ onSuccess });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.brand}>
              <Text style={styles.logo}>m</Text>
              <Text style={styles.brandName}>mercado</Text>
            </View>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>
                Todo empieza por aquí.
              </Text>
              <Text style={styles.subtitle}>Inicia sesión en Mercado.</Text>
            </View>
            {notice ? (
              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.successBanner}
              >
                <Text style={styles.successText}>{notice}</Text>
              </View>
            ) : null}
            <LoginForm
              isLoading={isLoading}
              onSubmit={async (values) => {
                await login(values);
              }}
              submitError={error}
            />
            <Text style={styles.demoHint}>
              Usa una cuenta válida de Fake Store API. El rol se asigna según el ID del
              usuario.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    elevation: 2,
    gap: spacing.lg,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    color: colors.surface,
    fontSize: 31,
    textAlign: 'center',
    lineHeight: 45,
  },
  brandName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  header: { gap: spacing.sm },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 24 },
  demoHint: { color: colors.textMuted, fontSize: typography.small, textAlign: 'center' },
  successBanner: {
    backgroundColor: colors.successBackground,
    borderRadius: 8,
    padding: spacing.md,
  },
  successText: { color: colors.success, fontSize: typography.label },
});
