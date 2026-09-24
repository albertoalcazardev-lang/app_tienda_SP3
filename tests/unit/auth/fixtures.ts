import type { Session } from '@/features/auth/domain/entities/Session';

export const sessionFixture: Session = {
  token: 'jwt-demo',
  user: {
    id: 3,
    username: 'auditor_demo',
    email: 'auditor@example.com',
    displayName: 'Ada Auditora',
    role: 'auditor',
  },
};

export const userDto = {
  id: 3,
  username: 'auditor_demo',
  email: 'auditor@example.com',
  name: { firstname: 'Ada', lastname: 'Auditora' },
} as const;
