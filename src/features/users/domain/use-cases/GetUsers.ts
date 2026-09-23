import type { User } from '../entities/User';
import type { UserRepository } from '../repositories/UserRepository';

export class GetUsers {
  constructor(private readonly userRepository: UserRepository) {}

  execute(): Promise<User[]> {
    return this.userRepository.getUsers();
  }
}