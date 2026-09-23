import { useContext } from 'react';

import { DependenciesContext } from './DependenciesProvider';

export function useDependencies() {
  const dependencies = useContext(DependenciesContext);

  if (!dependencies) {
    throw new Error(
      'useDependencies debe usarse dentro de DependenciesProvider.',
    );
  }

  return dependencies;
}
