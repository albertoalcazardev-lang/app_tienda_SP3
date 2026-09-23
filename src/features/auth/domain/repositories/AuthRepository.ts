import type { User } from '../entities/User';

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
