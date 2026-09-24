import type { User } from '../entities/User';
import type { AuthRepository } from '../repositories/AuthRepository';

export class GetCurrentUser {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }
}
