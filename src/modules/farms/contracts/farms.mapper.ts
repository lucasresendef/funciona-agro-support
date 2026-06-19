import type { FarmDto } from "./farms.dto";
import type { FarmEntity } from "./farms.entity";
export function mapFarmDtoToEntity(dto: FarmDto): FarmEntity {
  return { ...dto };
}
