"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ siteName = "发卡商城" }: { siteName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [kw, setKw] = useState("");

  const links = [
    { href: "/", label: "首页" },
    { href: "/query", label: "查卡密" },
    { href: "/faq", label: "常见问题" },
    { href: "/after-sale", label: "售后反馈" },
  ];

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">{siteName}</Link>
        <nav className="nav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-search">
          <span style={{ fontSize: 14, color: "#9ca3af" }}>🔍</span>
          <input
            placeholder="搜索商品..."
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && kw.trim()) {
                router.push(`/?kw=${encodeURIComponent(kw.trim())}`);
              }
            }}
          />
        </div>
        <div className="nav-actions">
          <Link href="/query" className="btn btn-outline" style={{ padding: "7px 14px", fontSize: 13 }}>
            我的订单
          </Link>
        </div>
      </div>
    </header>
  );
}
