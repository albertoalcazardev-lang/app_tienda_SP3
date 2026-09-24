import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { useDependencies } from '@/application/di/useDependencies';
import type { Session } from '@/features/auth/domain/entities/Session';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextValue {
  readonly status: SessionStatus;
  readonly session: Session | null;
  readonly notice: string | null;
  completeLogin(session: Session): void;
  clearAuthenticatedSession(notice?: string): void;
  clearNotice(): void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const { getCurrentSession } = useDependencies();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const restorationVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const version = restorationVersion.current;

    void getCurrentSession
      .execute()
      .then((restoredSession) => {
        if (!active || version !== restorationVersion.current) {
          return;
        }

        setSession(restoredSession);
        setStatus(restoredSession ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (active && version === restorationVersion.current) {
          setSession(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      active = false;
    };
  }, [getCurrentSession]);

  const completeLogin = useCallback((authenticatedSession: Session) => {
    restorationVersion.current += 1;
    setSession(authenticatedSession);
    setNotice(null);
    setStatus('authenticated');
  }, []);

  const clearAuthenticatedSession = useCallback((message?: string) => {
    restorationVersion.current += 1;
    setSession(null);
    setNotice(message ?? null);
    setStatus('unauthenticated');
  }, []);

  const clearNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      status,
      session,
      notice,
      completeLogin,
      clearAuthenticatedSession,
      clearNotice,
    }),
    [
      clearAuthenticatedSession,
      clearNotice,
      completeLogin,
      notice,
      session,
      status,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider.');
  }

  return context;
}
