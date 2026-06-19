import type { FieldDto } from "./fields.dto";
import type { FieldEntity } from "./fields.entity";
export function mapFieldDtoToEntity(dto: FieldDto): FieldEntity {
  return { ...dto };
}
