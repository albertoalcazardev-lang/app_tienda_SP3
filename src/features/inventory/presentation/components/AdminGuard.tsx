import type { PropsWithChildren } from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@/features/auth/presentation/hooks/useSession';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';
export function AdminGuard({ children }: PropsWithChildren) {
  const { user, isInitializing } = useSession();
  if (isInitializing) return <LoadingIndicator label="Revisando permisos" />;
  if (user?.role !== 'admin') return <Redirect href="/(main)/inventory" />;
  return children;
}
