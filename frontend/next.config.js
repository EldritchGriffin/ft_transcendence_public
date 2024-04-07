const { ModuleKind } = require("typescript");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "cdn.intra.42.fr"],
    loader: "default",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};
module.exports = nextConfig;
