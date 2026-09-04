"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderModal from "@/components/OrderModal";
import { fetchProductDetail, fetchSite, type ProductDetail } from "@/lib/api";

export default function ProductDetailPage() {
  const [id, setId] = useState("");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [siteName, setSiteName] = useState("发卡商城");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showOrder, setShowOrder] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("id") || "";
    setId(pid);
    fetchSite().then((s) => setSiteName(s.site_name || "发卡商城")).catch(() => {});
    if (!pid) { setErr("缺少商品ID"); setLoading(false); return; }
    fetchProductDetail(pid)
      .then((p) => setProduct(p))
      .catch((e) => setErr(e.message || "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <><Navbar siteName={siteName} /><div style={{ padding: 80, textAlign: "center" }}><div className="spinner" /></div><Footer siteName={siteName} /></>
  );
  if (err || !product) return (
    <><Navbar siteName={siteName} /><div className="empty"><div className="empty-icon">😢</div><div>{err || "商品不存在"}</div><Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>返回首页</Link></div><Footer siteName={siteName} /></>
  );

  return (
    <>
      <Navbar siteName={siteName} />
      <main className="container" style={{ maxWidth: 900 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 24, padding: 24, flexWrap: "wrap" }}>
            <div style={{ width: 280, height: 280, borderRadius: 10, background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, flexShrink: 0 }}>
              {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : "🎁"}
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>{product.name}</h1>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>{product.description}</div>
              <div style={{ background: "#fef2f2", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: "#6b7280" }}>价格</span>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#dc2626" }}>
                  <small style={{ fontSize: 16 }}>¥</small>{product.price}
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span style={{ fontSize: 14, color: "#9ca3af", textDecoration: "line-through", marginLeft: 10, fontWeight: 400 }}>¥{product.original_price}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                <span>库存：<strong style={{ color: product.stock > 0 ? "#16a34a" : "#dc2626" }}>{product.stock}</strong></span>
                <span>已售：{product.sales}</span>
                <span>分类：{product.category_name || "未分类"}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: "12px 32px", fontSize: 16 }}
                disabled={product.stock <= 0}
                onClick={() => setShowOrder(true)}
              >
                {product.stock <= 0 ? "已售罄" : "立即购买"}
              </button>
            </div>
          </div>
        </div>

        {product.purchase_notice && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 20, marginTop: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>📋 购买须知</h3>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{product.purchase_notice}</p>
          </div>
        )}
        {product.tutorial && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 20, marginTop: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>📖 使用教程</h3>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{product.tutorial}</p>
          </div>
        )}
      </main>
      <Footer siteName={siteName} />
      {showOrder && <OrderModal product={product} onClose={() => setShowOrder(false)} />}
    </>
  );
}
