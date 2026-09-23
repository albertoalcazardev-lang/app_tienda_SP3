export interface UserDto {
  readonly id: number;
  readonly email: string;
  readonly username: string;
  readonly name: {
    readonly firstname: string;
    readonly lastname: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isUserDto(value: unknown): value is UserDto {
  if (!isRecord(value) || !isRecord(value.name)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.email === 'string' &&
    typeof value.username === 'string' &&
    value.username.trim().length > 0 &&
    typeof value.name.firstname === 'string' &&
    typeof value.name.lastname === 'string'
  );
}
