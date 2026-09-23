import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { useDependencies } from '@/application/di/useDependencies';
import { isAppError } from '@/shared/errors/AppError';

import { useSession } from './useSession';

export interface LoginFieldErrors {
  readonly username?: string;
  readonly password?: string;
}

function toUserMessage(error: unknown): string {
  if (!isAppError(error)) {
    return 'No pudimos iniciar sesión. Inténtalo nuevamente.';
  }

  switch (error.code) {
    case 'invalid-credentials':
      return 'Usuario o contraseña inválidos';
    case 'offline':
      return 'Sin conexión. Revisa tu acceso a internet.';
    case 'invalid-response':
      return 'La respuesta del servidor no es válida.';
    case 'timeout':
      return 'La solicitud tardó demasiado. Inténtalo nuevamente.';
    case 'unexpected':
      return 'No pudimos iniciar sesión. Inténtalo nuevamente.';
  }
}

export function useLogin() {
  const router = useRouter();
  const { loginUser } = useDependencies();
  const { status, completeLogin } = useSession();
  const [username, setUsernameValue] = useState('');
  const [password, setPasswordValue] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(main)');
    }
  }, [router, status]);

  const clearRequestError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const setUsername = useCallback(
    (value: string) => {
      setUsernameValue(value);
      setFieldErrors((current) => ({ ...current, username: undefined }));
      clearRequestError();
    },
    [clearRequestError],
  );

  const setPassword = useCallback(
    (value: string) => {
      setPasswordValue(value);
      setFieldErrors((current) => ({ ...current, password: undefined }));
      clearRequestError();
    },
    [clearRequestError],
  );

  const submit = useCallback(async () => {
    if (submittingRef.current) {
      return;
    }

    const nextErrors: LoginFieldErrors = {
      ...(username.trim().length === 0
        ? { username: 'Ingresa tu usuario.' }
        : {}),
      ...(password.length === 0 ? { password: 'Ingresa tu contraseña.' } : {}),
    };

    setFieldErrors(nextErrors);
    setErrorMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submittingRef.current = true;
    setIsLoading(true);

    try {
      const session = await loginUser.execute({ username, password });
      completeLogin(session);
    } catch (error) {
      setErrorMessage(toUserMessage(error));
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  }, [completeLogin, loginUser, password, username]);

  return {
    username,
    password,
    fieldErrors,
    errorMessage,
    isLoading,
    setUsername,
    setPassword,
    submit,
  };
}
