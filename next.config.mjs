/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
