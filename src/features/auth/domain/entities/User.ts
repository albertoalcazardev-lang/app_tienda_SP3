export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role?: 'admin' | 'client' | 'auditor';
}
