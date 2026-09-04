"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchFAQs, type FAQ } from "@/lib/api";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs()
      .then((list) => setFaqs(list))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const defaultFaqs: FAQ[] = [
    { id: 1, question: "付款后多久能收到卡密？", answer: "全自动发货，付款成功后系统立即自动发卡，页面会自动跳转发卡结果。如未自动跳转，可在「查卡密」页面输入订单号查询。" },
    { id: 2, question: "卡密怎么使用？", answer: "每个商品详情页都有使用教程，购买成功后也会在发卡页面显示兑换链接和使用说明，请仔细阅读。" },
    { id: 3, question: "买错了可以退款吗？", answer: "虚拟商品一经售出概不退换，请在购买前仔细阅读商品说明和购买须知。如遇卡密无效等问题，请联系客服处理。" },
    { id: 4, question: "订单号和查询密码忘了怎么办？", answer: "订单号和查询密码在下单时生成并显示，请务必保存。如遗忘，可在「我的订单」中用下单时的联系方式+任意一笔订单的查询密码查看全部订单。" },
  ];

  const list = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <>
      <Navbar siteName="发卡商城" />
      <main className="container" style={{ maxWidth: 700 }}>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>❓ 常见问题</h2>
        {loading ? <div className="spinner" /> : list.map((f) => (
          <div key={f.id} style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
            <div
              style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 500 }}
              onClick={() => setOpenId(openId === f.id ? null : f.id)}
            >
              <span>{f.question}</span>
              <span style={{ color: "#9ca3af", transition: ".2s", transform: openId === f.id ? "rotate(180deg)" : "none" }}>▼</span>
            </div>
            {openId === f.id && (
              <div style={{ padding: "0 18px 16px", fontSize: 14, color: "#4b5563", lineHeight: 1.8, borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                {f.answer}
              </div>
            )}
          </div>
        ))}
      </main>
      <Footer siteName="发卡商城" />
    </>
  );
}
