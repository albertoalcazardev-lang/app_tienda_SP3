import { resolveUserRole } from '@/features/auth/domain/services/resolveUserRole';

it.each([
  [1, 'administrator'],
  [2, 'administrator'],
  [3, 'auditor'],
  [4, 'client'],
] as const)('asigna el rol del ID %i', (id, role) => {
  expect(resolveUserRole(id)).toBe(role);
});

it('rechaza IDs inválidos', () => {
  expect(() => resolveUserRole(0)).toThrow();
});
