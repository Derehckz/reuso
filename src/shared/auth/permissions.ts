import type { UserRole } from "@/generated/prisma/client";

export const PERMISSIONS = {
  "dashboard:view": ["ADMIN", "STAFF"],
  "products:read": ["ADMIN", "STAFF"],
  "products:write": ["ADMIN", "STAFF"],
  "products:delete": ["ADMIN"],
  "categories:write": ["ADMIN", "STAFF"],
  "attributes:read": ["ADMIN", "STAFF"],
  "attributes:write": ["ADMIN"],
  "inventory:write": ["ADMIN", "STAFF"],
  "orders:read": ["ADMIN", "STAFF"],
  "orders:write": ["ADMIN", "STAFF"],
  "orders:export": ["ADMIN", "STAFF"],
  "customers:read": ["ADMIN", "STAFF"],
  "customers:write": ["ADMIN"],
  "customers:block": ["ADMIN"],
  "coupons:read": ["ADMIN", "STAFF"],
  "coupons:write": ["ADMIN"],
  "content:write": ["ADMIN", "STAFF"],
  "settings:read": ["ADMIN"],
  "settings:write": ["ADMIN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export function assertPermission(role: UserRole, permission: Permission): void {
  if (!roleHasPermission(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
