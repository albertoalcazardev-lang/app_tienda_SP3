import type { UserDto } from '@/features/auth/data/dto/UserDto';
import type { Session } from '@/features/auth/domain/entities/Session';

export const userDto: UserDto = {
  id: 3,
  email: 'auditor@example.test',
  username: 'auditor_demo',
  name: {
    firstname: 'Ada',
    lastname: 'Auditora',
  },
};

export const sessionFixture: Session = {
  token: 'token-de-prueba',
  user: {
    id: 3,
    email: 'auditor@example.test',
    username: 'auditor_demo',
    displayName: 'Ada Auditora',
    role: 'auditor',
  },
};
