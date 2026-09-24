import type { GetCurrentUser } from '@/features/auth/domain/use-cases/GetCurrentUser';
import type { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import type { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import type { GetCarts } from '@/features/carts/domain/use-cases/GetCarts';
import type { GetUsers } from '@/features/users/domain/use-cases/GetUsers';

export interface Dependencies {
  readonly loginUser: LoginUser;
  readonly logoutUser: LogoutUser;
  readonly getCurrentUser: GetCurrentUser;
  readonly getUsers: GetUsers;
  readonly getCarts: GetCarts;
}