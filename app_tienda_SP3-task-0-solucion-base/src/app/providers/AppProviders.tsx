import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DependenciesProvider } from '@/app/di/DependenciesProvider';
import { SessionProvider } from '@/features/auth/presentation/session/SessionProvider';

import type { PropsWithChildren } from 'react';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <DependenciesProvider>
        <SessionProvider>{children}</SessionProvider>
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
