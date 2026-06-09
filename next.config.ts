import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // В твоей версии Next.js этот параметр должен лежать строго на верхнем уровне, а не в experimental
    allowedDevOrigins: ['192.168.1.105:3000', '192.168.1.105', 'localhost:3000']
};

export default nextConfig;