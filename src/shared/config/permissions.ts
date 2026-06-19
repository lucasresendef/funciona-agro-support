import type { AuthMeResponse } from "@/shared/types/auth";

export function isAppAdmin(profile: AuthMeResponse | null): boolean {
  return profile?.authUser.realmRoles.includes("app-admin") ?? false;
}

export function isSupportAdmin(profile: AuthMeResponse | null): boolean {
  return profile?.authUser.realmRoles.includes("support-admin") ?? false;
}

export function isPortalAdmin(profile: AuthMeResponse | null): boolean {
  return isAppAdmin(profile) || isSupportAdmin(profile);
}

export function isTenantMember(profile: AuthMeResponse | null): boolean {
  return Boolean(profile?.authUser.tenantId);
}
