import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qqqi.top"),
  title: {
    default: "甜甜发卡 - 苹果P12个人证书 | iOS自签IPA签名 微信多开软件多开 破解版软件安装",
    template: "%s | 甜甜发卡",
  },
  description: "甜甜发卡提供苹果 iOS P12 个人证书，支持 IPA 签名、微信多开、软件多开、应用分身与破解版软件安装，全能签、轻松签、万能签自签工具一站式自助下单，即买即签。",
  keywords: "苹果P12个人证书,P12证书,iOS证书签名,苹果IPA签名,IPA签名工具,IPA自签,微信多开,微信分身,软件多开,应用多开,全能签,轻松签,万能签,苹果手机自签,自签证书,破解版软件,安装破解软件,不越狱签名,企业证书,苹果签名平台",
  authors: [{ name: "甜甜发卡" }],
  creator: "甜甜发卡",
  publisher: "甜甜发卡",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "甜甜发卡",
    title: "甜甜发卡 - 苹果P12个人证书 | iOS自签IPA签名 微信多开软件多开",
    description: "苹果 iOS P12 个人证书购买，支持 IPA 签名、微信多开、软件多开、破解版软件安装，全能签轻松签万能签自签工具自助下单。",
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
    description: "苹果 iOS P12 个人证书购买，支持 IPA 签名、微信多开、软件多开、破解版软件安装，全能签轻松签万能签自签工具一站式自助下单。",
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
