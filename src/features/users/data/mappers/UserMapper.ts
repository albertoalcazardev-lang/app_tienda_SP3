import type { User } from '../../domain/entities/User';
import type { UserDto } from '../dto/UserDto';

const ADMIN_IDS: ReadonlySet<number> = new Set([1, 2]);
const AUDITOR_IDS: ReadonlySet<number> = new Set([3]);

export class UserMapper {
  static toDomain(dto: UserDto): User {
    return {
      id: dto.id,
      fullName: `${dto.name.firstname} ${dto.name.lastname}`,
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      role: resolveRole(dto.id),
    };
  }
}

function resolveRole(id: number): User['role'] {
  if (ADMIN_IDS.has(id)) return 'admin';
  if (AUDITOR_IDS.has(id)) return 'auditor';
  return 'client';
}
