import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth/presentation/hooks/useSession';

export default function IndexRoute() {
  const { status } = useSession();

  return (
    <Redirect href={status === 'authenticated' ? '/(main)' : '/(auth)/login'} />
  );
}
