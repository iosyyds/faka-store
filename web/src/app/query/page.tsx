"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { queryOrder, fetchOrderList, type OrderInfo } from "@/lib/api";
export default function QueryPage() {
  const [tab, setTab] = useState<"single" | "list">("single");
  const [orderNo, setOrderNo] = useState("");
  const [pwd, setPwd] = useState("");
  const [contact, setContact] = useState("");
  const [listPwd, setListPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  async function handleQuery() {
    if (!orderNo.trim() || !pwd.trim()) { setErr("请输入订单号和查询密码"); return; }
    setLoading(true); setErr(""); setOrder(null);
    try { setOrder(await queryOrder(orderNo.trim(), pwd.trim())); } catch (e: any) { setErr(e.message || "查询失败"); }
    finally { setLoading(false); }
  }
  async function handleList() {
    if (!contact.trim() || !listPwd.trim()) { setErr("请输入联系方式和查询密码"); return; }
    setLoading(true); setErr(""); setOrders([]);
    try { setOrders(await fetchOrderList(contact.trim(), listPwd.trim())); } catch (e: any) { setErr(e.message || "查询失败"); }
    finally { setLoading(false); }
  }
  function copy(text: string) { navigator.clipboard?.writeText(text).catch(() => {}); }
  const statusMap: Record<number, { label: string; cls: string }> = { 0: { label: "待支付", cls: "tag-yellow" }, 1: { label: "已完成", cls: "tag-green" }, 2: { label: "已取消", cls: "tag-gray" }, 3: { label: "已退款", cls: "tag-red" } };
  return (
    <>
      <Navbar siteName="发卡商城" />
      <main className="container" style={{ maxWidth: 700 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 20, textAlign: "center" }}>🔑 查询订单 / 卡密</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button className={`btn ${tab === "single" ? "btn-primary" : "btn-outline"}`} style={{ flex: 1 }} onClick={() => { setTab("single"); setErr(""); setOrder(null); }}>订单号查询</button>
            <button className={`btn ${tab === "list" ? "btn-primary" : "btn-outline"}`} style={{ flex: 1 }} onClick={() => { setTab("list"); setErr(""); setOrders([]); }}>我的订单</button>
          </div>
          {tab === "single" ? (
            <div>
              <div className="form-group"><label className="form-label">订单号</label><input className="form-input" placeholder="如 FK20260904xxxxxx" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">查询密码</label><input className="form-input" type="password" placeholder="下单时生成的6位密码" value={pwd} onChange={(e) => setPwd(e.target.value)} /></div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={handleQuery} disabled={loading}>{loading ? "查询中..." : "立即查询"}</button>
            </div>
          ) : (
            <div>
              <div className="form-group"><label className="form-label">联系方式（下单时填写的）</label><input className="form-input" placeholder="手机号 / 邮箱 / QQ" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">查询密码</label><input className="form-input" type="password" placeholder="任意一笔订单的查询密码" value={listPwd} onChange={(e) => setListPwd(e.target.value)} /></div>
              <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={handleList} disabled={loading}>{loading ? "查询中..." : "查看全部订单"}</button>
            </div>
          )}
          {err && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 12, textAlign: "center" }}>{err}</div>}
          {order && (
            <div style={{ marginTop: 20, padding: 16, background: "#f9fafb", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>{order.product_name}{order.spec_name ? ` - ${order.spec_name}` : ""}</span>
                <span className={`tag ${statusMap[order.status]?.cls}`}>{statusMap[order.status]?.label}</span>
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>订单号：{order.order_no}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>数量：{order.quantity} · 金额：¥{order.total_amount}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>下单时间：{order.created_at}</div>
              {order.status === 1 && order.cards.map((c, i) => (<div key={i} className="card-secret"><div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>卡密 {i + 1}</div>{c.content}<button className="copy-btn" onClick={() => copy(c.content)}>复制</button></div>))}
              {order.status === 0 && <div style={{ fontSize: 13, color: "#d97706" }}>订单待支付，请尽快完成付款</div>}
            </div>
          )}
          {orders.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>共 {orders.length} 笔订单</div>
              {orders.map((o) => (
                <div key={o.order_no} style={{ padding: 14, background: "#f9fafb", borderRadius: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{o.product_name}</span>
                    <span className={`tag ${statusMap[o.status]?.cls}`}>{statusMap[o.status]?.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{o.order_no} · {o.created_at}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>¥{o.total_amount} · {o.quantity}件</div>
                  {o.status === 1 && o.cards.map((c, i) => (<div key={i} className="card-secret" style={{ marginTop: 8 }}><div style={{ fontSize: 11, color: "#6b7280" }}>卡密{i + 1}</div>{c.content}<button className="copy-btn" onClick={() => copy(c.content)}>复制</button></div>))}
                </div>
              ))}
            </div>
          )}
          {tab === "list" && !loading && orders.length === 0 && !err && (<div className="empty" style={{ padding: "30px 0" }}><div className="empty-icon">📭</div><div>暂无订单</div></div>)}
        </div>
      </main>
      <Footer siteName="发卡商城" />
    </>
  );
}
