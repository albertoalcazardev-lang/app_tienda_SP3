import { useLocalSearchParams } from 'expo-router';

import { CartDetailScreen } from '@/features/carts/presentation/screens/CartDetailScreen';

export default function CartDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cartId = Number(id);

  return <CartDetailScreen cartId={cartId} />;
}