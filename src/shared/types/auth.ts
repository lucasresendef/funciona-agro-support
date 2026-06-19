import type { ISODateString, UUID } from "./common";

export interface AppUserEntity {
  id: UUID;
  keycloakUserId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface FarmEntity {
  id: UUID;
  name: string;
  description: string | null;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface FieldEntity {
  id: UUID;
  farmId: UUID;
  name: string;
  areaHectares: number;
  description: string | null;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  farm?: FarmEntity;
}

export type FarmUserRole = "OWNER" | "MANAGER" | "OPERATOR" | "VIEWER";

export interface FarmPermissionEntity {
  id: UUID;
  farmId: UUID;
  userId?: UUID;
  keycloakUserId?: string;
  role: FarmUserRole;
  active: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface AuthenticatedUser {
  sub: string;
  tenantId: string;
  name: string | null;
  email: string | null;
  preferredUsername: string | null;
  scope: string | null;
  realmRoles: string[];
  resourceRoles: Record<string, { roles?: string[] }>;
}

export interface AuthMeResponse {
  authUser: AuthenticatedUser;
  user: AppUserEntity | null;
  permissions: Array<FarmPermissionEntity & { farm: FarmEntity }>;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  refreshExpiresIn: number | null;
  tokenType: string | null;
  scope: string | null;
  user: {
    sub: string | null;
    name: string | null;
    email: string | null;
    preferredUsername: string | null;
  };
}
