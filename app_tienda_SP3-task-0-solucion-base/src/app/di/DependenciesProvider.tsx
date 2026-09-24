import { createContext, useState } from 'react';

import type { PropsWithChildren } from 'react';
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
  const [resolvedDependencies] = useState<Dependencies>(
    () => dependencies ?? createDependencies(),
  );

  return (
    <DependenciesContext.Provider value={resolvedDependencies}>
      {children}
    </DependenciesContext.Provider>
  );
}
