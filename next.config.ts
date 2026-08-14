import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Por omissão o limite é 1MB, que rejeita facilmente uma planta em PDF,
      // uma foto de obra, ou vários ficheiros enviados de uma vez.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
