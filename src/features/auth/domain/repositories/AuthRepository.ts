import type { Session } from '../entities/Session';

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<Session>;
  getCurrentSession(): Promise<Session | null>;
}
