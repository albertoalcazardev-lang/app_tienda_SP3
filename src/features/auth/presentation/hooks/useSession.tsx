import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useDependencies } from '@/application/di/useDependencies';
import type { Session } from '@/features/auth/domain/entities/Session';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextValue {
  readonly status: SessionStatus;
  readonly session: Session | null;
  completeLogin(session: Session): void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const { getCurrentSession } = useDependencies();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;

    void getCurrentSession
      .execute()
      .then((restoredSession) => {
        if (!active) {
          return;
        }

        setSession(restoredSession);
        setStatus(restoredSession ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (active) {
          setSession(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      active = false;
    };
  }, [getCurrentSession]);

  const completeLogin = useCallback((authenticatedSession: Session) => {
    setSession(authenticatedSession);
    setStatus('authenticated');
  }, []);

  const value = useMemo(
    () => ({ status, session, completeLogin }),
    [completeLogin, session, status],
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
