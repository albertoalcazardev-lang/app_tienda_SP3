import type { GetCurrentSessionUseCase } from '@/features/auth/domain/use-cases/GetCurrentSession';
import type { LoginUserUseCase } from '@/features/auth/domain/use-cases/LoginUser';
import type { LogoutUserUseCase } from '@/features/auth/domain/use-cases/LogoutUser';

export interface Dependencies {
  readonly loginUser: LoginUserUseCase;
  readonly getCurrentSession: GetCurrentSessionUseCase;
  readonly logoutUser: LogoutUserUseCase;
}
