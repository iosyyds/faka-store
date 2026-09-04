'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';

interface Faq { id: number; question: string; answer: string; sort: number; }

export default function FaqPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/faq.php`).then(r => r.json()).then(d => {
      if (d.code === 0 && d.data) setFaqs(d.data);
    }).catch(() => {});
  }, []);

  const defaultFaqs: Faq[] = [
    { id: 1, question: '付款后多久能收到卡密？', answer: '支付成功后系统自动发货，通常1-5秒内即可在订单查询页面看到卡密。如遇网络延迟请稍候刷新。', sort: 1 },
    { id: 2, question: '卡密怎么使用？', answer: '每个商品都有对应的使用说明，支付成功后会在卡密下方显示兑换教程和使用链接，请按照说明操作。', sort: 2 },
    { id: 3, question: '买错了可以退款吗？', answer: '虚拟商品一经售出概不退款。请在购买前仔细阅读商品描述和购买须知，确认无误后再下单。', sort: 3 },
    { id: 4, question: '订单号忘了怎么办？', answer: '可通过订单查询页面，输入下单时填写的联系方式查询历史订单。建议保存好订单号以便后续查询。', sort: 4 },
  ];

  const list = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #eef0f3', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>甜</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>甜甜发卡</span>
          </div>
          <button onClick={() => router.push('/')} style={{ padding: '7px 16px', borderRadius: 8, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>返回首页</button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px', textAlign: 'center' }}>❓ 常见问题</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((f) => (
            <div key={f.id} style={{ background: '#fff', border: '1px solid #eef0f3', borderRadius: 10, overflow: 'hidden' }}>
              <div onClick={() => setOpenId(openId === f.id ? null : f.id)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500, color: '#111827' }}>
                <span>{f.question}</span>
                <span style={{ color: '#9ca3af', transition: '.2s', transform: openId === f.id ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>
              {openId === f.id && (
                <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.7, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>{f.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: '#fff', borderTop: '1px solid #eef0f3', marginTop: 40, padding: '24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>© {new Date().getFullYear()} 甜甜发卡 · 虚拟商品自动发卡平台</div>
      </footer>
    </div>
  );
}
