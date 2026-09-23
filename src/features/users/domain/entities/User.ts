export interface User {
  readonly id: number;
  readonly fullName: string;
  readonly username: string;
  readonly email: string;
  readonly phone: string;
  readonly role: 'admin' | 'auditor' | 'client';
}