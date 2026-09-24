import { useCallback, useRef, useState } from 'react';

import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';
import { useSession } from './useSession';

export interface LoginFormValues {
  readonly username: string;
  readonly password: string;
}

interface UseLoginOptions {
  readonly onSuccess?: () => void;
}

function loginMessage(error: unknown): string {
  const appError = toAppError(error);
  switch (appError.code) {
    case 'AUTH_INVALID_CREDENTIALS':
      return 'Usuario o contraseña inválidos';
    case 'OFFLINE':
    case 'NETWORK_ERROR':
      return 'Sin conexión. Revisa tu acceso a internet.';
    case 'TIMEOUT':
      return 'La solicitud tardó demasiado. Inténtalo nuevamente.';
    case 'INVALID_RESPONSE':
      return 'La respuesta del servidor no es válida.';
    case 'STORAGE_ERROR':
      return 'No pudimos guardar tu sesión de forma segura.';
    default:
      return 'No pudimos iniciar sesión. Inténtalo nuevamente.';
  }
}

export function useLogin(options: UseLoginOptions = {}) {
  const { loginUser } = useDependencies();
  const { completeLogin } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const login = useCallback(
    async (values: LoginFormValues): Promise<boolean> => {
      if (submitting.current) return false;
      submitting.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const session = await loginUser.execute(values);
        completeLogin(session);
        options.onSuccess?.();
        return true;
      } catch (caught: unknown) {
        setError(loginMessage(caught));
        return false;
      } finally {
        submitting.current = false;
        setIsLoading(false);
      }
    },
    [completeLogin, loginUser, options],
  );

  return { login, isLoading, error } as const;
}
