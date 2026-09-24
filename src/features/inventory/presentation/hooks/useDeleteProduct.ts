import { useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useDependencies } from '@/app/di/useDependencies';
import { toAppError } from '@/shared/errors/AppError';
export function useDeleteProduct(id: number, onDeleted: () => void) {
  const { inventory } = useDependencies();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const confirming = useRef(false);
  async function remove() {
    confirming.current = false;
    if (busy.current) return;
    busy.current = true;
    setDeleting(true);
    setError(null);
    try {
      await inventory.deleteProduct.execute(id);
      onDeleted();
    } catch (caught: unknown) {
      setError(toAppError(caught, 'No fue posible eliminar el producto.').message);
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  }
  function confirmDelete() {
    if (busy.current || confirming.current) return;
    confirming.current = true;
    const cancel = () => {
      confirming.current = false;
    };
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de eliminar este producto?')) void remove();
      else cancel();
      return;
    }
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: cancel },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void remove();
          },
        },
      ],
      { cancelable: true, onDismiss: cancel },
    );
  }
  return { deleting, error, confirmDelete };
}
