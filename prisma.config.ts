import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Kita gunakan fungsi env() bawaan Prisma, bukan process.env
    url: env('DIRECT_URL'),
  },
});