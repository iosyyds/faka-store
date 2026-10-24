import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qqqi.top"),
  title: {
    default: "甜甜发卡 - 苹果P12证书签名 | 全能签万能签轻松签 iOS自签IPA签名工具 微信软件多开",
    template: "%s | 甜甜发卡 - 苹果证书签名平台",
  },
  description: "甜甜发卡是苹果手机证书签名与应用多开自助购买平台，提供P12证书、iOS自签证书、全能签、万能签、轻松签、IPA签名工具、软件签名，支持微信多开、软件多开、应用分身。支付宝在线支付，付款后自动秒发卡密，24小时无人值守，即买即得。",
  keywords: "苹果P12证书,苹果证书签名,iOS签名,苹果签名平台,全能签,万能签,轻松签,苹果手机自签,P12证书,IPA签名工具,软件签名,微信多开,软件多开,应用多开,多开分身,企业证书,超级签名,UDID注册,自签证书,不越狱签名,签名工具下载,自动发卡,秒发卡密",
  authors: [{ name: "甜甜发卡" }],
  creator: "甜甜发卡",
  publisher: "甜甜发卡",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "甜甜发卡 - 苹果证书签名平台",
    title: "甜甜发卡 - 苹果P12证书签名 | 全能签万能签轻松签 iOS自签IPA签名工具 微信软件多开",
    description: "P12证书、全能签、万能签、轻松签、IPA签名工具、微信多开、软件多开自助购买，支付宝支付自动秒发卡密。",
    url: "https://qqqi.top",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
    description: "苹果手机证书签名、P12证书、全能签、万能签、轻松签、IPA签名工具与微信软件多开自助购买平台，支付宝支付自动秒发卡密。",
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
