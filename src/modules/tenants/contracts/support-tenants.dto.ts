import type { FarmUserRole } from "@/shared/types/auth";
import type { ISODateString, UUID } from "@/shared/types/common";

export interface TenantStatsDto {
  users: number;
  farms: number;
}

export interface TenantListItemDto {
  id: UUID;
  key: string;
  name: string;
  active: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  stats: TenantStatsDto;
}

export interface TenantUserDto {
  id: UUID;
  keycloakUserId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
  createdAt: ISODateString;
}

export interface TenantFieldDto {
  id: UUID;
  farmId?: UUID;
  name: string;
  areaHectares: number;
  description: string | null;
  active: boolean;
}

export interface TenantFarmDto {
  id: UUID;
  name: string;
  description: string | null;
  active: boolean;
  fields: TenantFieldDto[];
}

export interface TenantPermissionDto {
  id: UUID;
  farmId: UUID;
  keycloakUserId: string;
  userName: string;
  userEmail: string;
  role: FarmUserRole;
  active: boolean;
  farm: {
    id: UUID;
    name: string;
    description: string | null;
    active: boolean;
  };
}

export interface TenantDetailDto extends TenantListItemDto {
  users: TenantUserDto[];
  permissions: TenantPermissionDto[];
  farms: TenantFarmDto[];
}

export interface ListTenantsQueryDto {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export interface CreateTenantFieldInputDto {
  name: string;
  areaHectares: number;
  description?: string;
}

export interface CreateTenantFarmInputDto {
  name: string;
  description?: string;
  fields?: CreateTenantFieldInputDto[];
}

export interface CreateTenantRequestDto {
  key: string;
  name: string;
  adminUser: {
    username: string;
    name: string;
    email: string;
    password: string;
  };
  farms?: CreateTenantFarmInputDto[];
}

export interface CreateTenantResponseDto {
  id: UUID;
}

export interface CreateTenantUserRequestDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  farmPermissions?: Array<{
    farmId: UUID;
    role: FarmUserRole;
  }>;
}

export interface CreateTenantFarmRequestDto {
  name: string;
  description?: string;
}

export interface CreateTenantFieldRequestDto {
  farmId: UUID;
  name: string;
  areaHectares: number;
  description?: string;
}

export interface UpdateTenantRequestDto {
  key?: string;
  name?: string;
  active?: boolean;
}

export interface UpdateTenantUserRequestDto {
  name?: string;
  email?: string;
  isAdmin?: boolean;
  active?: boolean;
}

export interface ResetTenantUserPasswordRequestDto {
  password: string;
}

export interface UpdateTenantFarmRequestDto {
  name?: string;
  description?: string | null;
  active?: boolean;
}

export interface UpdateTenantFieldRequestDto {
  name?: string;
  areaHectares?: number;
  description?: string | null;
  active?: boolean;
}

export interface CreateTenantPermissionRequestDto {
  farmId: UUID;
  userId: UUID;
  role: FarmUserRole;
}

export interface UpdateTenantPermissionRequestDto {
  role?: FarmUserRole;
  active?: boolean;
}
