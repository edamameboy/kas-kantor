import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Matikan saat npm run dev agar tidak error
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Biarkan kosong atau isi dengan konfigurasi Next.js Anda yang lain
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: 10485760, // 10MB in bytes
    },
  },
};

export default process.env.NODE_ENV === "development" ? nextConfig : withSerwist(nextConfig);