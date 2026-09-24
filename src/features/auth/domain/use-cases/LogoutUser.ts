import type { AuthRepository } from '../repositories/AuthRepository';

export interface LogoutUserUseCase {
  execute(): Promise<void>;
}

export class LogoutUser implements LogoutUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
