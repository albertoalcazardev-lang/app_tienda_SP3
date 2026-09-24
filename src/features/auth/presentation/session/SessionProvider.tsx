import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDependencies } from '@/app/di/useDependencies';
import type { Session } from '../../domain/entities/Session';
import type { User } from '../../domain/entities/User';
import type { PropsWithChildren } from 'react';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SessionContextValue {
  readonly status: SessionStatus;
  readonly session: Session | null;
  readonly user: User | null;
  readonly isInitializing: boolean;
  readonly notice: string | null;
  completeLogin(session: Session): void;
  clearAuthenticatedSession(notice?: string): void;
  clearNotice(): void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

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
      .then((restored) => {
        if (!active || version !== restorationVersion.current) return;
        setSession(restored);
        setStatus(restored ? 'authenticated' : 'unauthenticated');
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

  const completeLogin = useCallback((value: Session) => {
    restorationVersion.current += 1;
    setSession(value);
    setNotice(null);
    setStatus('authenticated');
  }, []);

  const clearAuthenticatedSession = useCallback((message?: string) => {
    restorationVersion.current += 1;
    setSession(null);
    setNotice(message ?? null);
    setStatus('unauthenticated');
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);
  const value = useMemo(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isInitializing: status === 'loading',
      notice,
      completeLogin,
      clearAuthenticatedSession,
      clearNotice,
    }),
    [clearAuthenticatedSession, clearNotice, completeLogin, notice, session, status],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
