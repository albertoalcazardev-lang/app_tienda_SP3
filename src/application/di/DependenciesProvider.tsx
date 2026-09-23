import { createContext, useMemo, type PropsWithChildren } from 'react';

import type { Dependencies } from './Dependencies';
import { createDependencies } from './createDependencies';

export const DependenciesContext = createContext<Dependencies | null>(null);

interface DependenciesProviderProps extends PropsWithChildren {
  readonly dependencies?: Dependencies;
}

export function DependenciesProvider({
  children,
  dependencies,
}: DependenciesProviderProps) {
  const value = useMemo(
    () => dependencies ?? createDependencies(),
    [dependencies],
  );

  return (
    <DependenciesContext.Provider value={value}>
      {children}
    </DependenciesContext.Provider>
  );
}
