import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "发卡商城 · 全自动虚拟商品发卡",
  description: "全自动虚拟商品发卡平台，24小时无人值守，付款秒发，安全快捷。",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
