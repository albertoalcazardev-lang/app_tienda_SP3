import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { useDependencies } from '@/application/di/useDependencies';
import { isAppError } from '@/shared/errors/AppError';

import { useSession } from './useSession';

const LOGOUT_SUCCESS_MESSAGE =
  'Sesión cerrada. Tu información local se ha eliminado.';

function toLogoutMessage(error: unknown): string {
  if (isAppError(error) && error.code === 'secure-storage') {
    return 'No pudimos eliminar tu sesión de forma segura. Inténtalo nuevamente.';
  }

  return 'No pudimos cerrar tu sesión. Inténtalo nuevamente.';
}

export function useLogout() {
  const router = useRouter();
  const { logoutUser } = useDependencies();
  const { clearAuthenticatedSession } = useSession();
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const requestLogout = useCallback(() => {
    if (requestInFlight.current) {
      return;
    }

    setError(null);
    setConfirmationVisible(true);
  }, []);

  const cancelLogout = useCallback(() => {
    if (requestInFlight.current) {
      return;
    }

    setError(null);
    setConfirmationVisible(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setError(null);
    setLoggingOut(true);

    try {
      await logoutUser.execute();
      clearAuthenticatedSession(LOGOUT_SUCCESS_MESSAGE);
      router.replace('/(auth)/login');

      if (mounted.current) {
        setConfirmationVisible(false);
      }
    } catch (logoutError) {
      if (mounted.current) {
        setError(toLogoutMessage(logoutError));
      }
    } finally {
      requestInFlight.current = false;

      if (mounted.current) {
        setLoggingOut(false);
      }
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
