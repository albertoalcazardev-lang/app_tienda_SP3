import type {
  AuthRepository,
  LoginCredentials,
} from '../repositories/AuthRepository';
import type { Session } from '../entities/Session';

export interface LoginUserUseCase {
  execute(credentials: LoginCredentials): Promise<Session>;
}

export class LoginUser implements LoginUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<Session> {
    return this.authRepository.login({
      username: credentials.username.trim(),
      password: credentials.password,
    });
  }
}
