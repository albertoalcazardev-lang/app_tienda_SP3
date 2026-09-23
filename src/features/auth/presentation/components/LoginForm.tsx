import { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

import type { LoginFieldErrors } from '../hooks/useLogin';

interface LoginFormProps {
  readonly username: string;
  readonly password: string;
  readonly errors: LoginFieldErrors;
  readonly isLoading: boolean;
  readonly onUsernameChange: (value: string) => void;
  readonly onPasswordChange: (value: string) => void;
  readonly onSubmit: () => Promise<void>;
}

export function LoginForm({
  username,
  password,
  errors,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const passwordRef = useRef<TextInput>(null);

  return (
    <View style={styles.form}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          accessibilityLabel="Usuario"
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          editable={!isLoading}
          onChangeText={onUsernameChange}
          onSubmitEditing={() => passwordRef.current?.focus()}
          placeholder="Ingresa tu usuario"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="next"
          style={[styles.input, errors.username ? styles.inputError : null]}
          textContentType="username"
          value={username}
        />
        {errors.username ? (
          <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
            {errors.username}
          </Text>
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          ref={passwordRef}
          accessibilityLabel="Contraseña"
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          editable={!isLoading}
          onChangeText={onPasswordChange}
          onSubmitEditing={() => void onSubmit()}
          placeholder="Ingresa tu contraseña"
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          secureTextEntry
          style={[styles.input, errors.password ? styles.inputError : null]}
          textContentType="password"
          value={password}
        />
        {errors.password ? (
          <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
            {errors.password}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isLoading ? 'Iniciando sesión' : 'Iniciar sesión'}
        disabled={isLoading}
        onPress={() => void onSubmit()}
        style={({ pressed }) => [
          styles.button,
          pressed && !isLoading ? styles.buttonPressed : null,
          isLoading ? styles.buttonDisabled : null,
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingContent}>
            <ActivityIndicator color={colors.white} size="small" />
            <Text style={styles.buttonText}>Iniciando sesión…</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.label,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    color: colors.error,
    fontSize: typography.caption,
    lineHeight: 16,
  },
  button: {
    minHeight: 50,
    marginTop: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.button,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.76,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
