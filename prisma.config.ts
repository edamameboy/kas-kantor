import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Paksa sistem untuk membaca file .env
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // CLI Prisma mutlak membutuhkan jalur langsung untuk mengubah struktur tabel
    url: process.env.DIRECT_URL as string,
  },
});