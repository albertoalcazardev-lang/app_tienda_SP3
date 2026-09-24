import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth/presentation/hooks/useSession';
import { LoadingIndicator } from '@/shared/components/LoadingIndicator';

export default function IndexRoute() {
  const { user, isInitializing } = useSession();

  if (isInitializing) {
    return <LoadingIndicator label="Revisando sesión" />;
  }

  return <Redirect href={user ? '/(main)' : '/(auth)/login'} />;
}
