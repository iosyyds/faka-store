import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：产物是纯 HTML/JS，可直接部署到 GitHub Pages
  output: "export",
  // 静态站点没有图片优化服务，关闭 next/image 优化
  images: { unoptimized: true },
  // GitHub Pages 子路径部署（https://用户名.github.io/仓库名/）
  // 由 GitHub Actions 传入 NEXT_PUBLIC_BASE_PATH；部署在根路径时留空即可
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
