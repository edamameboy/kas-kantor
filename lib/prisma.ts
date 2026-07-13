import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// 1. Buat koneksi database menggunakan file SQLite
const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 3. Masukkan adapter ke dalam konstruktor PrismaClient
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;