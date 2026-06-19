import type { FarmPermissionDto } from "./farm-permissions.dto";
import type { FarmPermissionEntity } from "./farm-permissions.entity";
export function mapFarmPermissionDtoToEntity(dto: FarmPermissionDto): FarmPermissionEntity {
  return { ...dto };
}
