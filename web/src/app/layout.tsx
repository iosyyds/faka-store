import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qqqi.top"),
  title: {
    default: "甜甜发卡 - 24小时自动发卡平台 | 虚拟商品卡密自动发货秒发卡",
    template: "%s | 甜甜发卡 - 自动发卡平台",
  },
  description: "甜甜发卡是专业的24小时自动发卡平台，支持支付宝在线支付，付款后自动秒发卡密。提供虚拟商品、软件授权、会员账号、游戏点卡、激活码、CDKEY、充值卡等自助购买服务，安全可靠，即买即得。",
  keywords: "自动发卡,发卡平台,虚拟商品,卡密购买,自动发货,支付宝支付,24小时发卡,秒发卡,自助购买,软件授权,会员账号,游戏点卡,激活码,CDKEY,充值卡",
  authors: [{ name: "甜甜发卡" }],
  creator: "甜甜发卡",
  publisher: "甜甜发卡",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "甜甜发卡 - 24小时自动发卡平台",
    title: "甜甜发卡 - 24小时自动发卡平台 | 虚拟商品卡密自动发货秒发卡",
    description: "专业的24小时自动发卡平台，支付宝支付，自动秒发卡密。",
    url: "https://qqqi.top",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "甜甜发卡",
    url: "https://qqqi.top",
    description: "24小时自动发卡平台，支付宝支付，自动秒发卡密。",
    inLanguage: "zh-CN",
  };
  return (
    <html lang="zh-CN">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
