"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchProducts, type Product } from "@/lib/api";
import CheckoutModal from "./CheckoutModal";

/** 首页主体：商品列表 + 分类筛选 + 下单 */
export default function Shop({ siteName, notice }: { siteName: string; notice: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "商品加载失败")
      )
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const shown =
    category === "全部"
      ? products
      : products.filter((p) => p.category === category);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16">
      {/* Hero */}
      <section className="fade-up mt-14 text-center">
        <div className="glass glass-strong mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] text-[var(--ink-soft)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          支付宝当面付 · 自动秒发
        </div>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          <span className="gradient-text">秒付秒发</span>
          <br />
          虚拟商品自动发货
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
          {notice}
        </p>
      </section>

      {/* 分类筛选 */}
      <section className="fade-up mt-10 flex flex-wrap justify-center gap-2" style={{ animationDelay: "0.1s" }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`glass-chip ${category === c ? "active" : ""}`}
          >
            {c}
          </button>
        ))}
      </section>

      {/* 商品网格 */}
      <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass h-64 animate-pulse" />
          ))}

        {!loading &&
          shown.map((p, i) => (
            <article
              key={p.id}
              className="glass lift fade-up group flex flex-col p-6"
              style={{ animationDelay: `${0.12 * i}s` }}
            >
              {/* 商品图占位（无图时用渐变） */}
              <div className="mb-5 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400/60 via-violet-400/60 to-pink-400/60 shadow-inner">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-4xl font-black text-white/80 drop-shadow">
                    {p.name.slice(0, 1)}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <h3 className="m-0 text-[17px] font-bold leading-snug">
                  {p.name}
                </h3>
                <span className="shrink-0 rounded-full bg-white/30 px-2.5 py-1 text-[11px] text-[var(--ink-soft)] backdrop-blur-md">
                  {p.category}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
                {p.description || "付款后自动发货，请留意卡密信息。"}
              </p>

              <div className="mt-auto flex items-end justify-between pt-5">
                <div>
                  <div className="text-[22px] font-extrabold text-rose-500">
                    ￥{p.price}
                    {p.original_price && (
                      <span className="ml-2 text-[13px] font-normal text-[var(--ink-soft)] line-through">
                        ￥{p.original_price}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[var(--ink-soft)]">
                    库存 {p.stock} · 已售 {p.sales}
                  </div>
                </div>
                <button
                  onClick={() => setBuying(p)}
                  disabled={p.stock <= 0}
                  className="glass-btn accent px-5 py-2.5 text-[14px] disabled:opacity-50"
                >
                  {p.stock > 0 ? "立即购买" : "已售罄"}
                </button>
              </div>
            </article>
          ))}

        {!loading && shown.length === 0 && (
          <div className="glass col-span-full p-10 text-center text-[var(--ink-soft)]">
            该分类暂时没有商品
          </div>
        )}
      </section>

      {error && (
        <div className="glass mt-8 p-4 text-center text-sm text-rose-500">
          商品加载失败：{error}（请确认后端已部署并配置 NEXT_PUBLIC_API_BASE）
        </div>
      )}

      {/* 底部 */}
      <footer className="mt-16 text-center text-[13px] text-[var(--ink-soft)]">
        {siteName} · 虚拟商品自动发卡 · 有问题请联系客服
      </footer>

      {buying && (
        <CheckoutModal product={buying} onClose={() => setBuying(null)} />
      )}
    </main>
  );
}
