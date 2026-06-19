import type { FarmUserRole } from "@/shared/types/auth";
export interface FarmPermissionDto {
  id: string;
  farmId: string;
  keycloakUserId?: string;
  role: FarmUserRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
