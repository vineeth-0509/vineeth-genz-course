// lib/prisma.ts or lib/db.ts
import "server-only";
import { PrismaClient } from "../generated/prisma/client"; // ✅ you’re using a custom generated client

// Augment the global scope to cache Prisma client
declare global {
  // Prevent re-declaring in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  process.env.NODE_ENV === "production"
    ? new PrismaClient()
    : global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
