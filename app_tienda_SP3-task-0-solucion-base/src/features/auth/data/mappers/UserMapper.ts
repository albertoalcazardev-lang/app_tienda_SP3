import type { User } from '../../domain/entities/User';
import type { UserDto } from '../dto/UserDto';

export const UserMapper = {
  toDomain(dto: UserDto): User {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
    };
  },
} as const;
