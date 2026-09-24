import { useState } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { spacing } from '@/shared/theme/spacing';
import type { LoginFormValues } from '../hooks/useLogin';

interface Props {
  readonly onSubmit: (values: LoginFormValues) => Promise<void>;
  readonly isLoading: boolean;
  readonly submitError: string | null;
}

export function LoginForm({ onSubmit, isLoading, submitError }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  async function submit() {
    const next = {
      ...(username.trim() ? {} : { username: 'Ingresa tu usuario.' }),
      ...(password ? {} : { password: 'Ingresa tu contraseña.' }),
    };
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSubmit({ username, password });
  }

  return (
    <View style={{ gap: spacing.md }}>
      <AppInput
        accessibilityLabel="Usuario"
        autoCapitalize="none"
        autoComplete="username"
        editable={!isLoading}
        error={errors.username}
        label="Usuario"
        onChangeText={(value) => {
          setUsername(value);
          setErrors((current) => ({ ...current, username: undefined }));
        }}
        placeholder="Ingresa tu usuario"
        returnKeyType="next"
        value={username}
      />
      <AppInput
        accessibilityLabel="Contraseña"
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!isLoading}
        error={errors.password}
        label="Contraseña"
        onChangeText={(value) => {
          setPassword(value);
          setErrors((current) => ({ ...current, password: undefined }));
        }}
        onSubmitEditing={() => void submit()}
        placeholder="Ingresa tu contraseña"
        returnKeyType="done"
        secureTextEntry
        value={password}
      />
      <ErrorMessage message={submitError} />
      <AppButton
        accessibilityLabel="Iniciar sesión"
        disabled={isLoading}
        loading={isLoading}
        onPress={() => void submit()}
        title="Iniciar sesión"
      />
    </View>
  );
}
