import { AdminGuard } from '@/features/inventory/presentation/components/AdminGuard';
import { EditProductScreen } from '@/features/inventory/presentation/screens/EditProductScreen';
export default function EditProductRoute() {
  return (
    <AdminGuard>
      <EditProductScreen />
    </AdminGuard>
  );
}
