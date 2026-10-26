import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：同时兼容 Vercel 与 GitHub Pages（qqqi.top 自定义域名根路径）
  output: "export",
  images: { unoptimized: true },
  // 自定义域名根路径部署时留空；仓库子路径 iosyyds.github.io/faka-store 不可用，以自定义域名为正式入口
  basePath: "",
};

export default nextConfig;
