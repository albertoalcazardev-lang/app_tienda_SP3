import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DependenciesProvider } from '@/application/di/DependenciesProvider';
import { SessionProvider } from '@/features/auth/presentation/hooks/useSession';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <DependenciesProvider>
        <SessionProvider>{children}</SessionProvider>
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
