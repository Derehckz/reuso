import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  ADMIN_SIGN_IN_PATH,
  CUSTOMER_SIGN_IN_PATH,
  isAdminProtectedPath,
  isAdminSignInPath,
  isStaffRole,
} from "@/lib/constants/auth-routes";

const { auth } = NextAuth(authConfig);

function nextWithPathname(
  req: Parameters<Parameters<typeof auth>[0]>[0],
  pathname: string,
) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (isAdminSignInPath(pathname)) {
    if (isLoggedIn && isStaffRole(role)) {
      const callback = nextUrl.searchParams.get("callbackUrl");
      const target =
        callback?.startsWith("/admin") || callback?.startsWith("/admin-print")
          ? callback
          : "/admin";
      return NextResponse.redirect(new URL(target, nextUrl));
    }

    if (isLoggedIn && role === "CUSTOMER") {
      const cuenta = new URL("/cuenta", nextUrl);
      cuenta.searchParams.set("error", "no_admin_access");
      return NextResponse.redirect(cuenta);
    }

    return nextWithPathname(req, pathname);
  }

  if (isAdminProtectedPath(pathname)) {
    if (!isLoggedIn) {
      const login = new URL(ADMIN_SIGN_IN_PATH, nextUrl);
      login.searchParams.set(
        "callbackUrl",
        `${pathname}${nextUrl.search}`,
      );
      return NextResponse.redirect(login);
    }

    if (!isStaffRole(role)) {
      const login = new URL(ADMIN_SIGN_IN_PATH, nextUrl);
      login.searchParams.set("error", "staff_only");
      return NextResponse.redirect(login);
    }

    return nextWithPathname(req, pathname);
  }

  if (pathname.startsWith("/cuenta") && !isLoggedIn) {
    const login = new URL(CUSTOMER_SIGN_IN_PATH, nextUrl);
    login.searchParams.set("callbackUrl", `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return nextWithPathname(req, pathname);
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/admin-print/:path*",
    "/cuenta/:path*",
  ],
};
