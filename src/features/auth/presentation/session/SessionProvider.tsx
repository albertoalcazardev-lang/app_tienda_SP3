import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';

import type { PropsWithChildren } from 'react';
import type { User } from '../../domain/entities/User';

export interface SessionContextValue {
  readonly user: User | null;
  readonly isInitializing: boolean;
  readonly isLoggingOut: boolean;
  readonly error: string | null;
  readonly completeLogin: (user: User) => void;
  readonly logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const { getCurrentUser, logoutUser } = useDependencies();
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser.execute();
        if (active) setUser(currentUser);
      } catch (caught: unknown) {
        if (active)
          setError(toAppError(caught, 'No fue posible restaurar la sesión.').message);
      } finally {
        if (active) setIsInitializing(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [getCurrentUser]);

  const completeLogin = useCallback((authenticatedUser: User) => {
    setError(null);
    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      await logoutUser.execute();
    } catch (caught: unknown) {
      setError(toAppError(caught, 'No fue posible cerrar la sesión remota.').message);
    } finally {
      setUser(null);
      setIsLoggingOut(false);
    }
  }, [logoutUser]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isInitializing,
      isLoggingOut,
      error,
      completeLogin,
      logout,
    }),
    [completeLogin, error, isInitializing, isLoggingOut, logout, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
