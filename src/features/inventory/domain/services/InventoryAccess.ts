import type { User } from '@/features/auth/domain/entities/User';
import { AppError } from '@/shared/errors/AppError';
export interface CurrentUserReader {
  getCurrentUser(): Promise<User | null>;
}
export interface InventoryAccess {
  requireAdministrator(): Promise<void>;
}
export class SessionInventoryAccess implements InventoryAccess {
  constructor(private readonly session: CurrentUserReader) {}
  async requireAdministrator(): Promise<void> {
    const user = await this.session.getCurrentUser();
    if (user?.role !== 'admin')
      throw new AppError(
        'Solo un administrador puede modificar el inventario.',
        'FORBIDDEN',
      );
  }
}
