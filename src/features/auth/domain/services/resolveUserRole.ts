import type { UserRole } from '../entities/UserRole';

export function resolveUserRole(userId: number): UserRole {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('El ID de usuario debe ser un entero positivo.');
  }

  if (userId === 1 || userId === 2) {
    return 'administrator';
  }

  if (userId === 3) {
    return 'auditor';
  }

  return 'client';
}
