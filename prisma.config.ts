import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Paksa sistem untuk membaca file .env
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL as string,
    directUrl: process.env.DIRECT_URL as string,
  },
});