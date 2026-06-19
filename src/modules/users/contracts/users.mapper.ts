import type { AppUserDto } from "./users.dto";
import type { AppUserEntity } from "./users.entity";

export function mapUserDtoToEntity(dto: AppUserDto): AppUserEntity {
  return { ...dto };
}
