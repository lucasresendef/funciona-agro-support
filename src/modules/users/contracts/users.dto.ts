export interface AppUserDto {
  id: string;
  keycloakUserId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
