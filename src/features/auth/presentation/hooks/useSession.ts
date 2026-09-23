import { useContext } from 'react';

import { SessionContext } from '../session/SessionProvider';
import type { SessionContextValue } from '../session/SessionProvider';

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error('useSession debe utilizarse dentro de un SessionProvider.');
  }
  return session;
}
