import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';
import { useSession } from './useSession';

const SUCCESS = 'Sesión cerrada. Tu información local se ha eliminado.';

export function useLogout() {
  const router = useRouter();
  const { logoutUser } = useDependencies();
  const { clearAuthenticatedSession } = useSession();
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const requestLogout = useCallback(() => {
    if (!inFlight.current) {
      setError(null);
      setConfirmationVisible(true);
    }
  }, []);
  const cancelLogout = useCallback(() => {
    if (!inFlight.current) {
      setError(null);
      setConfirmationVisible(false);
    }
  }, []);
  const confirmLogout = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    setLoggingOut(true);
    try {
      await logoutUser.execute();
      clearAuthenticatedSession(SUCCESS);
      router.replace('/(auth)/login');
      if (mounted.current) setConfirmationVisible(false);
    } catch (caught: unknown) {
      if (mounted.current)
        setError(
          toAppError(caught).code === 'STORAGE_ERROR'
            ? 'No pudimos eliminar tu sesión de forma segura. Inténtalo nuevamente.'
            : 'No pudimos cerrar tu sesión. Inténtalo nuevamente.',
        );
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoggingOut(false);
    }
  }, [clearAuthenticatedSession, logoutUser, router]);
  return {
    isConfirmationVisible,
    isLoggingOut,
    error,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
