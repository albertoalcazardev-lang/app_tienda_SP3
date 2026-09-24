import type { User } from './User';

export interface Session {
  readonly token: string;
  readonly user: User;
}
