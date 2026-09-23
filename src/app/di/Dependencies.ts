import type { GetCurrentUser } from '@/features/auth/domain/use-cases/GetCurrentUser';
import type { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import type { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';

import type { InventoryDependencies } from './createInventoryDependencies';

export interface Dependencies {
  readonly inventory: InventoryDependencies;
  readonly loginUser: LoginUser;
  readonly logoutUser: LogoutUser;
  readonly getCurrentUser: GetCurrentUser;
}
