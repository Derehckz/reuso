import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import type { UserRole } from "@/generated/prisma/client";
import { isStaffRole } from "@/lib/constants/auth-routes";
import { clientIp, rateLimit } from "@/shared/rate-limit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    error?: "SessionRevoked";
  }
}

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const hdrs = await headers();
        const ip = clientIp(hdrs);
        const rl = rateLimit(`login:${ip}`, 10, 15 * 60_000);
        if (!rl.allowed) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash || user.isBlocked || user.deletedAt) {
          return null;
        }

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash,
        );

        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: {
            id: true,
            role: true,
            name: true,
            image: true,
            isBlocked: true,
            deletedAt: true,
          },
        });
        if (!dbUser || dbUser.isBlocked || dbUser.deletedAt) {
          token.error = "SessionRevoked";
        } else {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          delete token.error;
        }
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      await Promise.all([
        prisma.cart.upsert({
          where: { userId: user.id! },
          update: {},
          create: { userId: user.id! },
        }),
        prisma.wishlist.upsert({
          where: { userId: user.id! },
          update: {},
          create: { userId: user.id! },
        }),
      ]);
    },
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!isStaffRole(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
