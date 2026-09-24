import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { spacing } from '@/shared/theme/spacing';

import { loginSchema } from '../schemas/loginSchema';
import type { LoginFormValues } from '../schemas/loginSchema';

interface LoginFormProps {
  readonly onSubmit: (values: LoginFormValues) => Promise<void>;
  readonly isLoading: boolean;
  readonly submitError: string | null;
}

export function LoginForm({ onSubmit, isLoading, submitError }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  return (
    <View style={{ gap: spacing.md }}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            accessibilityLabel="Correo electrónico"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
            error={errors.email?.message}
            keyboardType="email-address"
            label="Correo electrónico"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="demo@demo.com"
            returnKeyType="next"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            accessibilityLabel="Contraseña"
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
            error={errors.password?.message}
            label="Contraseña"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Tu contraseña"
            returnKeyType="done"
            secureTextEntry
            value={value}
          />
        )}
      />

      <ErrorMessage message={submitError} />
      <AppButton
        accessibilityLabel="Iniciar sesión"
        disabled={isLoading}
        loading={isLoading}
        onPress={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        title="Iniciar sesión"
      />
    </View>
  );
}
