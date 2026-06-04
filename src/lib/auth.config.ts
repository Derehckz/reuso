import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  isAdminSignInPath,
  isStaffRole,
} from "@/lib/constants/auth-routes";

export const authConfig = {
  pages: {
    signIn: "/auth/iniciar-sesion",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname;

      if (isAdminSignInPath(pathname)) {
        return true;
      }

      if (pathname.startsWith("/admin-print")) {
        if (!isLoggedIn) return false;
        return isStaffRole(role);
      }

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (!isStaffRole(role)) return false;

        const adminOnlyPrefixes = [
          "/admin/configuracion",
          "/admin/atributos",
        ];
        if (adminOnlyPrefixes.some((p) => pathname.startsWith(p))) {
          return role === "ADMIN";
        }

        return true;
      }

      if (pathname.startsWith("/cuenta")) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.error === "SessionRevoked") {
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
} satisfies NextAuthConfig;
