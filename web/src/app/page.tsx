"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import ProductCard from "@/components/ProductCard";
import { fetchSite, fetchCategories, fetchProducts, type SiteInfo, type Category, type Product } from "@/lib/api";
export default function Home() {
  const [urlKw, setUrlKw] = useState("");
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState(0);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlKw(params.get("kw") || "");
    Promise.all([fetchSite(), fetchCategories()]).then(([s, c]) => {
      setSite(s); setCats(c);
      const popup = s.announcements?.find((a) => a.is_popup === 1);
      if (popup) setShowAnnouncement(true);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    setLoading(true); setErr("");
    fetchProducts({ category_id: activeCat ? String(activeCat) : "", keyword: urlKw, sort })
      .then((res) => setProducts(res.list || []))
      .catch((e) => setErr(e.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [activeCat, sort, urlKw]);
  const siteName = site?.site_name || "发卡商城";
  const popup = site?.announcements?.find((a) => a.is_popup === 1);
  return (
    <>
      <Navbar siteName={siteName} />
      <Marquee items={site?.recent_orders || []} />
      {showAnnouncement && popup && (
        <div className="modal-mask" onClick={(e) => { if (e.target === e.currentTarget) setShowAnnouncement(false); }}>
          <div className="modal-box" style={{ padding: 24, maxWidth: 400 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>📢 {popup.title}</h3>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{popup.content}</p>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={() => setShowAnnouncement(false)}>我知道了</button>
          </div>
        </div>
      )}
      <main className="container">
        {site?.announcements?.[0] && !site.announcements[0].is_popup && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#1d4ed8" }}>📢 {site.announcements[0].title}：{site.announcements[0].content}</div>
        )}
        <div className="cat-bar">
          <span className={`cat-chip ${activeCat === 0 ? "active" : ""}`} onClick={() => setActiveCat(0)}>全部商品</span>
          {cats.map((c) => (<span key={c.id} className={`cat-chip ${activeCat === c.id ? "active" : ""}`} onClick={() => setActiveCat(c.id)}>{c.icon} {c.name}</span>))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <span className={`cat-chip ${sort === "default" ? "active" : ""}`} onClick={() => setSort("default")}>综合</span>
            <span className={`cat-chip ${sort === "sales" ? "active" : ""}`} onClick={() => setSort("sales")}>销量</span>
            <span className={`cat-chip ${sort === "price_asc" ? "active" : ""}`} onClick={() => setSort("price_asc")}>价格↑</span>
          </div>
        </div>
        {loading ? <div style={{ padding: 60, textAlign: "center" }}><div className="spinner" /></div> :
        err ? <div className="empty"><div className="empty-icon">😢</div><div>商品加载失败：{err}</div><div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>请检查后端接口是否正常</div></div> :
        products.length === 0 ? <div className="empty"><div className="empty-icon">📦</div><div>该分类暂时没有商品</div></div> :
        <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </main>
      <Footer siteName={siteName} customerService={site?.customer_service} qqGroup={site?.qq_group} copyright={site?.copyright} />
    </>
  );
}
