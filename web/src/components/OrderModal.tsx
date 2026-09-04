"use client";
import { useEffect, useRef, useState } from "react";
import { createOrder, queryOrder, type ProductDetail, type OrderInfo } from "@/lib/api";
type Step = "form" | "pay" | "success" | "error";
export default function OrderModal({ product, onClose }: { product: ProductDetail; onClose: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [specId, setSpecId] = useState<number>(product.specs?.[0]?.id || 0);
  const [quantity, setQuantity] = useState(1);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [queryPwd, setQueryPwd] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPrice = product.has_spec && product.specs?.length ? product.specs.find((s) => s.id === specId)?.price || product.price : product.price;
  const currentStock = product.has_spec && product.specs?.length ? product.specs.find((s) => s.id === specId)?.stock || 0 : product.stock;
  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); if (pollRef.current) clearInterval(pollRef.current); }; }, []);
  async function handleSubmit() {
    if (!contact.trim()) { setErr("请输入联系方式"); return; }
    if (currentStock <= 0) { setErr("库存不足"); return; }
    setLoading(true); setErr("");
    try {
      const res = await createOrder({ product_id: product.id, spec_id: specId || undefined, quantity, contact: contact.trim() });
      setOrderNo(res.order_no); setQueryPwd(res.query_pwd); setQrCode(res.qr_code); setTotalAmount(res.total_amount);
      setCountdown(res.pay_timeout * 60); setStep("pay"); startPolling(res.order_no, res.query_pwd); startCountdown();
    } catch (e: any) { setErr(e.message || "下单失败"); }
    finally { setLoading(false); }
  }
  function startCountdown() {
    timerRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { if (timerRef.current) clearInterval(timerRef.current); setErr("支付超时，订单已取消"); setStep("error"); return 0; } return c - 1; });
    }, 1000);
  }
  function startPolling(no: string, pwd: string) {
    pollRef.current = setInterval(async () => {
      try {
        const o = await queryOrder(no, pwd);
        if (o.status === 1) { if (pollRef.current) clearInterval(pollRef.current); if (timerRef.current) clearInterval(timerRef.current); setOrder(o); setStep("success"); }
        else if (o.status === 2) { if (pollRef.current) clearInterval(pollRef.current); setErr("订单已取消"); setStep("error"); }
      } catch {}
    }, 2500);
  }
  function copy(text: string) { navigator.clipboard?.writeText(text).catch(() => {}); }
  const qtyBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 600, color: "#374151" };
  return (
    <div className="modal-mask" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{step === "form" && "确认订单"}{step === "pay" && "扫码支付"}{step === "success" && "支付成功"}{step === "error" && "订单异常"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
        </div>
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{product.has_spec && product.specs?.find((s) => s.id === specId) ? `规格：${product.specs.find((s) => s.id === specId)?.spec_name}` : "自动发货 · 秒到账"}</div>
        </div>
        {step === "form" && (
          <div>
            {product.has_spec && product.specs?.length ? (
              <div className="form-group">
                <label className="form-label">选择规格</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.specs.map((s) => (
                    <button key={s.id} onClick={() => setSpecId(s.id)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: specId === s.id ? "#4f46e5" : "#e5e7eb", background: specId === s.id ? "#eef2ff" : "#fff", color: specId === s.id ? "#4f46e5" : "#374151", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{s.spec_name} ¥{s.price}</button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="form-group">
              <label className="form-label">购买数量</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={qtyBtn}>-</button>
                <span style={{ fontWeight: 600, minWidth: 30, textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, currentStock, quantity + 1))} style={qtyBtn}>+</button>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>库存 {currentStock}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">联系方式 *（用于查询订单和卡密）</label>
              <input className="form-input" placeholder="手机号 / 邮箱 / QQ号" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0" }}>
              <span style={{ color: "#6b7280", fontSize: 14 }}>应付金额</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#dc2626" }}>¥{(parseFloat(currentPrice) * quantity).toFixed(2)}</span>
            </div>
            {err && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={handleSubmit} disabled={loading}>{loading ? "创建订单中..." : "立即支付"}</button>
          </div>
        )}
        {step === "pay" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#dc2626", marginBottom: 4 }}>¥{totalAmount}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>订单号：{orderNo} · 剩余 {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}</div>
            {qrCode ? <div style={{ display: "inline-block", padding: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}><img src={qrCode} alt="支付二维码" style={{ width: 200, height: 200, display: "block" }} /></div> : <div className="spinner" style={{ margin: "20px auto" }} />}
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 14 }}>请使用支付宝扫码支付，支付成功后自动发卡</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>查询密码：{queryPwd}（请妥善保存）</div>
            <button className="btn btn-outline" style={{ marginTop: 16, width: "100%" }} onClick={onClose}>稍后支付</button>
          </div>
        )}
        {step === "success" && order && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a", marginTop: 8 }}>支付成功，已自动发货</div>
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>订单号：{order.order_no}</div>
            {order.cards.map((c, i) => (
              <div key={i} className="card-secret">
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>卡密 {i + 1}</div>
                {c.content}
                <button className="copy-btn" onClick={() => copy(c.content)}>复制</button>
              </div>
            ))}
            {product.tutorial && <div style={{ background: "#fef9c3", padding: 10, borderRadius: 8, fontSize: 13, marginTop: 10 }}><strong>使用教程：</strong>{product.tutorial}</div>}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={onClose}>完成</button>
          </div>
        )}
        {step === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div style={{ fontSize: 15, color: "#dc2626", marginTop: 10 }}>{err || "订单处理失败"}</div>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={onClose}>关闭</button>
          </div>
        )}
      </div>
    </div>
  );
}
