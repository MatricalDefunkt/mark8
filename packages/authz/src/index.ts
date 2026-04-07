import type { RoleKey } from "@vada/contracts";

export const permissionKeys = [
  "workflow:execute",
  "workflow:manage",
  "billing:view",
  "billing:manage",
  "support:create",
  "support:manage",
  "users:manage",
  "dashboard:admin",
  "dashboard:billing",
  "dashboard:sales",
  "dashboard:client",
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

const rolePermissionMap: Record<RoleKey, readonly PermissionKey[]> = {
  admin: [
    "workflow:execute",
    "workflow:manage",
    "billing:view",
    "billing:manage",
    "support:create",
    "support:manage",
    "users:manage",
    "dashboard:admin",
    "dashboard:billing",
    "dashboard:sales",
    "dashboard:client",
  ],
  billing: [
    "billing:view",
    "billing:manage",
    "support:create",
    "dashboard:billing",
  ],
  sales: [
    "workflow:execute",
    "billing:view",
    "support:create",
    "support:manage",
    "dashboard:sales",
  ],
  client: ["workflow:execute", "support:create", "dashboard:client"],
};

export const permissionsForRole = (role: RoleKey): readonly PermissionKey[] => {
  return rolePermissionMap[role];
};

export const hasPermission = (
  role: RoleKey,
  permission: PermissionKey,
): boolean => {
  return permissionsForRole(role).includes(permission);
};

export const assertPermission = (
  role: RoleKey,
  permission: PermissionKey,
): void => {
  if (!hasPermission(role, permission)) {
    throw new Error(`Role ${role} does not have ${permission} permission.`);
  }
};
