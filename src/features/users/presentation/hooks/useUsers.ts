import { useCallback, useEffect, useState } from 'react';

import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';

import type { User } from '../../domain/entities/User';

interface UseUsersResult {
  readonly users: readonly User[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly reload: () => void;
}

export function useUsers(): UseUsersResult {
  const { getUsers } = useDependencies();
  const [users, setUsers] = useState<readonly User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUsers.execute();
        if (isActive) setUsers(result);
      } catch (caught: unknown) {
        if (isActive) {
          setError(toAppError(caught, 'No fue posible cargar los usuarios.').message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [getUsers, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { users, isLoading, error, reload };
}