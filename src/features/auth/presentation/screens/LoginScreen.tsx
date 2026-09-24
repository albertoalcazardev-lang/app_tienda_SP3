import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { useSession } from '../hooks/useSession';

export function LoginScreen() {
  const login = useLogin();
  const { notice } = useSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View accessibilityLabel="Mercado" style={styles.brandBlock}>
              <View style={styles.logoMark}>
                <Text style={styles.logoLetter}>m</Text>
              </View>
              <Text style={styles.brandName}>mercado</Text>
            </View>

            <View style={styles.headingBlock}>
              <Text accessibilityRole="header" style={styles.title}>
                Todo empieza por aquí.
              </Text>
              <Text style={styles.subtitle}>Inicia sesión en Mercado.</Text>
            </View>

            {notice ? (
              <View
                accessibilityLabel={notice}
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                style={styles.successBanner}
                testID="session-closed-banner"
              >
                <Text style={styles.successText}>{notice}</Text>
              </View>
            ) : null}

            {login.errorMessage ? (
              <View
                accessibilityLabel={login.errorMessage}
                accessibilityLiveRegion="assertive"
                accessibilityRole="alert"
                style={styles.errorBanner}
                testID="login-error-banner"
              >
                <Text style={styles.errorSymbol}>!</Text>
                <Text style={styles.errorText}>{login.errorMessage}</Text>
              </View>
            ) : null}

            <LoginForm
              errors={login.fieldErrors}
              isLoading={login.isLoading}
              onPasswordChange={login.setPassword}
              onSubmit={login.submit}
              onUsernameChange={login.setUsername}
              password={login.password}
              username={login.username}
            />

            <View style={styles.demoBlock}>
              <Text style={styles.demoText}>
                Acceso de demostración: utiliza una cuenta válida de Fake Store
                API.
              </Text>
              <Text style={styles.demoText}>
                El perfil se asigna automáticamente después del acceso.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.page,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: colors.white,
    fontSize: 31,
    fontWeight: '400',
    lineHeight: 36,
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '600',
  },
  headingBlock: {
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '400',
    lineHeight: 39,
    maxWidth: 300,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  errorBanner: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.errorBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  successBanner: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.successBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  successText: {
    color: colors.success,
    fontSize: typography.label,
    lineHeight: 20,
  },
  errorSymbol: {
    width: 20,
    color: colors.error,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.label,
    lineHeight: 20,
  },
  demoBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.xxs,
  },
  demoText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 17,
  },
});
