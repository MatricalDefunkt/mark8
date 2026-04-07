import { assertPermission, type PermissionKey } from "@mark8/authz";
import { roleKeySchema, type RoleKey } from "@mark8/contracts";

export const getRoleFromSearchParams = (input: string | null): RoleKey => {
  const parsed = roleKeySchema.safeParse(input ?? "client");
  return parsed.success ? parsed.data : "client";
};

export const ensurePermission = (
  role: RoleKey,
  permission: PermissionKey,
): void => {
  assertPermission(role, permission);
};
