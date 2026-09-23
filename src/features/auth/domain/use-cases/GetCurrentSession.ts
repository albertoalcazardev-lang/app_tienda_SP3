import type { Session } from '../entities/Session';
import type { AuthRepository } from '../repositories/AuthRepository';

export interface GetCurrentSessionUseCase {
  execute(): Promise<Session | null>;
}

export class GetCurrentSession implements GetCurrentSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<Session | null> {
    return this.authRepository.getCurrentSession();
  }
}
