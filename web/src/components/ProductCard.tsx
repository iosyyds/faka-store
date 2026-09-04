"use client";
import Link from "next/link";
import type { Product } from "@/lib/api";
export default function ProductCard({ product }: { product: Product }) {
  const soldout = product.stock <= 0;
  return (
    <Link href={`/product?id=${product.id}`} className="product-card">
      {product.is_top ? <span className="badge badge-top">置顶</span> : null}
      {product.is_hot ? <span className="badge badge-hot" style={{ left: product.is_top ? 56 : 10 }}>热门</span> : null}
      {soldout ? <span className="badge badge-soldout" style={{ right: 10, left: "auto" }}>已售罄</span> : null}
      <div className="product-img">
        {product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>🎁</span>}
      </div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-desc">{product.description || "自动发货 · 秒到账"}</div>
        <div className="product-meta">
          <div className="product-price">
            <small>¥</small>{product.price}
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) ? (
              <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", marginLeft: 6, fontWeight: 400 }}>¥{product.original_price}</span>
            ) : null}
          </div>
          <div className="product-stock">
            {soldout ? "已售罄" : `库存 ${product.stock}`}
            <span style={{ marginLeft: 6, color: "#d1d5db" }}>|</span>
            <span style={{ marginLeft: 6 }}>已售{product.sales}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
