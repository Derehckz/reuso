/** Inicio de sesión tienda (clientes). */
export const CUSTOMER_SIGN_IN_PATH = "/auth/iniciar-sesion";

/** Inicio de sesión panel interno (staff / admin). */
export const ADMIN_SIGN_IN_PATH = "/admin/login";

export function isAdminSignInPath(pathname: string): boolean {
  return (
    pathname === ADMIN_SIGN_IN_PATH ||
    pathname.startsWith(`${ADMIN_SIGN_IN_PATH}/`)
  );
}

export function isAdminProtectedPath(pathname: string): boolean {
  return (
    (pathname.startsWith("/admin") && !isAdminSignInPath(pathname)) ||
    pathname.startsWith("/admin-print")
  );
}

export function isStaffRole(role: string | undefined | null): boolean {
  return role === "ADMIN" || role === "STAFF";
}
