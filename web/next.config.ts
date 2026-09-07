import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 原生部署，不使用静态导出
  images: { unoptimized: true },
  // 子路径部署（GitHub Pages 时用）；Vercel 根域名部署时留空
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
