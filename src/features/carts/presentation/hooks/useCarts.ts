import { useCallback, useEffect, useState } from 'react';

import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';

import type { Cart } from '../../domain/entities/Cart';

interface UseCartsResult {
  readonly carts: readonly Cart[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly reload: () => void;
}

export function useCarts(): UseCartsResult {
  const { getCarts } = useDependencies();
  const [carts, setCarts] = useState<readonly Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCarts.execute();
        if (isActive) setCarts(result);
      } catch (caught: unknown) {
        if (isActive) {
          setError(toAppError(caught, 'No fue posible cargar el historial de carritos.').message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [getCarts, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { carts, isLoading, error, reload };
}