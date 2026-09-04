"use client";

import Link from "next/link";

/** 顶部玻璃导航 */
export default function Navbar({ siteName }: { siteName: string }) {
  return (
    <header className="sticky top-0 z-40 flex justify-center px-4 pt-4">
      <div className="glass glass-strong flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-violet-500 to-pink-500 text-lg font-bold text-white shadow-lg">
            发
          </span>
          <span className="text-[17px] font-bold text-[var(--ink)]">
            {siteName}
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/query"
            className="glass-chip"
            style={{ padding: "8px 14px" }}
          >
            查卡密
          </Link>
        </nav>
      </div>
    </header>
  );
}
