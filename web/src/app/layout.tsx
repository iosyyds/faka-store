import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "发卡小店 · 秒发自动发货",
  description: "虚拟商品自动发卡商城，付款后自动秒发，安全快捷。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {/* 液态玻璃衬底：流动渐变 + 漂浮光斑 */}
        <div className="app-bg" aria-hidden />
        <div className="blob blob-1" aria-hidden />
        <div className="blob blob-2" aria-hidden />
        <div className="blob blob-3" aria-hidden />
        {children}
      </body>
    </html>
  );
}
