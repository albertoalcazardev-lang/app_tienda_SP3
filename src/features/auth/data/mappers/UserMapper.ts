import type { User } from '../../domain/entities/User';
import type { UserDto } from '../dto/UserDto';
import { resolveUserRole } from '../../domain/services/resolveUserRole';

export const UserMapper = {
  toDomain(dto: UserDto): User {
    const displayName = `${dto.name.firstname} ${dto.name.lastname}`.trim();

    return {
      id: dto.id,
      username: dto.username,
      email: dto.email,
      displayName: displayName || dto.username,
      role: resolveUserRole(dto.id),
    };
  },
} as const;
