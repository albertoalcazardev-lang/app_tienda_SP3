import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/features/auth/presentation/hooks/useSession';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';

export default function MainLayout() {
  const { user, isInitializing } = useSession();

  if (isInitializing) return <LoadingIndicator label="Revisando sesión" />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
