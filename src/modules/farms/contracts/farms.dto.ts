export interface FarmDto {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
