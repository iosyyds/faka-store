"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitAfterSale } from "@/lib/api";
export default function AfterSalePage() {
  const [orderNo, setOrderNo] = useState("");
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  async function handleSubmit() {
    if (!orderNo.trim() || !contact.trim() || !content.trim()) { setErr("请填写全部信息"); return; }
    setLoading(true); setErr("");
    try { await submitAfterSale({ order_no: orderNo.trim(), contact: contact.trim(), content: content.trim() }); setSuccess(true); }
    catch (e: any) { setErr(e.message || "提交失败"); }
    finally { setLoading(false); }
  }
  if (success) return (
    <>
      <Navbar siteName="发卡商城" />
      <main className="container" style={{ maxWidth: 500 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <h3 style={{ margin: "12px 0 8px" }}>提交成功</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>我们已收到您的售后反馈，客服会尽快处理，请留意联系方式。</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setSuccess(false); setOrderNo(""); setContent(""); }}>继续提交</button>
        </div>
      </main>
      <Footer siteName="发卡商城" />
    </>
  );
  return (
    <>
      <Navbar siteName="发卡商城" />
      <main className="container" style={{ maxWidth: 560 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 24 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>💬 售后反馈</h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>如遇卡密无效、商品问题等，请填写以下信息，客服会尽快处理。</p>
          <div className="form-group"><label className="form-label">订单号 *</label><input className="form-input" placeholder="FK开头的订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">联系方式 *</label><input className="form-input" placeholder="QQ / 微信 / 手机号，方便客服联系您" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">问题描述 *</label><textarea className="form-input" rows={5} placeholder="请详细描述您遇到的问题..." value={content} onChange={(e) => setContent(e.target.value)} style={{ resize: "vertical" }} /></div>
          {err && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{err}</div>}
          <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={handleSubmit} disabled={loading}>{loading ? "提交中..." : "提交反馈"}</button>
        </div>
      </main>
      <Footer siteName="发卡商城" />
    </>
  );
}
