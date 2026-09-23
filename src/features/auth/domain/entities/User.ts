import type { UserRole } from './UserRole';

export interface User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: UserRole;
}
