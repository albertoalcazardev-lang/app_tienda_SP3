export interface UserDto {
  readonly id: number;
  readonly email: string;
  readonly username: string;
  readonly phone: string;
  readonly name: {
    readonly firstname: string;
    readonly lastname: string;
  };
}
