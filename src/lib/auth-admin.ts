import { auth, requireAuth } from "@/lib/auth";
import { isStaffRole } from "@/lib/constants/auth-routes";
import type { Permission } from "@/shared/auth/permissions";
import { assertPermission } from "@/shared/auth/permissions";
import { AppError } from "@/shared/errors/app-error";

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  if (!isStaffRole(session.user.role)) {
    throw AppError.forbidden();
  }
  try {
    assertPermission(session.user.role, permission);
  } catch {
    throw AppError.forbidden();
  }
  return session;
}

export async function requireAdminOnly() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw AppError.forbidden("Solo administradores");
  }
  return session;
}

export async function getAdminSession() {
  const session = await auth();
  if (!session?.user) return null;
  if (!isStaffRole(session.user.role)) {
    return null;
  }
  return session;
}
