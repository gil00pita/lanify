const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/** @type {import("next").NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
