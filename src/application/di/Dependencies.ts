import type { GetCurrentSessionUseCase } from '@/features/auth/domain/use-cases/GetCurrentSession';
import type { LoginUserUseCase } from '@/features/auth/domain/use-cases/LoginUser';

export interface Dependencies {
  readonly loginUser: LoginUserUseCase;
  readonly getCurrentSession: GetCurrentSessionUseCase;
}
