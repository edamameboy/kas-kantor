import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 1. Buat koneksi pool menggunakan URL Supabase
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Bungkus ke dalam Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke dalam konstruktor (seperti yang diminta Vercel/Prisma)
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;