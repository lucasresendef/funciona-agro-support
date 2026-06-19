export interface FieldDto {
  id: string;
  farmId: string;
  name: string;
  areaHectares: number;
  description: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
