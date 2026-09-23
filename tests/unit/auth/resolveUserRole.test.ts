import { resolveUserRole } from '@/features/auth/domain/services/resolveUserRole';

describe('resolveUserRole', () => {
  it.each([1, 2])('asigna Administrador al ID %i', (id) => {
    expect(resolveUserRole(id)).toBe('administrator');
  });

  it('asigna Auditor al ID 3', () => {
    expect(resolveUserRole(3)).toBe('auditor');
  });

  it('asigna Cliente a cualquier otro ID válido', () => {
    expect(resolveUserRole(4)).toBe('client');
    expect(resolveUserRole(20)).toBe('client');
  });

  it('rechaza identificadores inválidos', () => {
    expect(() => resolveUserRole(0)).toThrow();
    expect(() => resolveUserRole(1.5)).toThrow();
  });
});
