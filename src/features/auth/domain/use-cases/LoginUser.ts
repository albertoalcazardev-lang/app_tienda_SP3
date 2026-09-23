import type { AuthRepository, LoginCredentials } from '../repositories/AuthRepository';
import type { User } from '../entities/User';

export class LoginUser {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<User> {
    return this.authRepository.login({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
  }
}
