export interface UserDto {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role?: 'admin' | 'client' | 'auditor';
}

export interface AuthSessionDto {
  readonly user: UserDto;
  readonly accessToken: string;
}

export interface LoginRequestDto {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponseDto {
  readonly user: UserDto;
  readonly accessToken: string;
}
