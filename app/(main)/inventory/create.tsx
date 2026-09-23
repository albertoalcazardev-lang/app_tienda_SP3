import { AdminGuard } from '@/features/inventory/presentation/components/AdminGuard';
import { ProductEditor } from '@/features/inventory/presentation/components/ProductEditor';
export default function CreateProductRoute() {
  return (
    <AdminGuard>
      <ProductEditor />
    </AdminGuard>
  );
}
