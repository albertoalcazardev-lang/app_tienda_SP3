import { useContext } from 'react';

import { DependenciesContext } from './DependenciesProvider';
import type { Dependencies } from './Dependencies';

export function useDependencies(): Dependencies {
  const dependencies = useContext(DependenciesContext);
  if (dependencies === null) {
    throw new Error('useDependencies debe utilizarse dentro de un DependenciesProvider.');
  }
  return dependencies;
}
