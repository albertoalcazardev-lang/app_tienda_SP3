import type { User } from '../../domain/entities/User';
import { resolveUserRole } from '../../domain/services/resolveUserRole';
import type { UserDto } from '../dto/UserDto';

export class UserMapper {
  toDomain(dto: UserDto): User {
    const displayName = `${dto.name.firstname} ${dto.name.lastname}`.trim();

    return {
      id: dto.id,
      username: dto.username,
      email: dto.email,
      displayName: displayName.length > 0 ? displayName : dto.username,
      role: resolveUserRole(dto.id),
    };
  }
}
