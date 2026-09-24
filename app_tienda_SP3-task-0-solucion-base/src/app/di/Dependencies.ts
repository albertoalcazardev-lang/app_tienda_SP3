import type { GetCurrentUser } from '@/features/auth/domain/use-cases/GetCurrentUser';
import type { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import type { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';

export interface Dependencies {
  readonly loginUser: LoginUser;
  readonly logoutUser: LogoutUser;
  readonly getCurrentUser: GetCurrentUser;
}
