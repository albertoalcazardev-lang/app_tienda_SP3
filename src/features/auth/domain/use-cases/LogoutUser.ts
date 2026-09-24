import type { AuthRepository } from '../repositories/AuthRepository';

export class LogoutUser {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
