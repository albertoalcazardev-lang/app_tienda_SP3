import { useCallback, useState } from 'react';

import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';

import type { User } from '../../domain/entities/User';
import type { LoginFormValues } from '../schemas/loginSchema';
import { useSession } from './useSession';

interface UseLoginOptions {
  readonly onSuccess?: (user: User) => void;
}

export function useLogin(options: UseLoginOptions = {}) {
  const { loginUser } = useDependencies();
  const { completeLogin } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (values: LoginFormValues): Promise<boolean> => {
      if (isLoading) return false;

      setIsLoading(true);
      setError(null);
      try {
        const user = await loginUser.execute(values);
        completeLogin(user);
        options.onSuccess?.(user);
        return true;
      } catch (caught: unknown) {
        setError(toAppError(caught, 'No fue posible iniciar sesión.').message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [completeLogin, isLoading, loginUser, options],
  );

  return { login, isLoading, error } as const;
}
