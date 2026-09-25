import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { toAppError } from '@/shared/errors/AppError';
export function useProductQuery<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(null);
      void load()
        .then((value) => {
          if (active) setData(value);
        })
        .catch((caught: unknown) => {
          if (active)
            setError(toAppError(caught, 'No fue posible cargar el inventario.').message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
      // revision permite reintentar la misma consulta sin cambiar la función load.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, revision]),
  );
  return { data, error, loading, retry: () => setRevision((value) => value + 1) };
}
