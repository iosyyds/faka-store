'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';
interface Faq { id: number; question: string; answer: string; sort: number; }
interface SiteInfo { site_name: string; site_logo: string; }
const appleBlue = '#007AFF';
const appleGray = '#F2F2F7';
const appleText = '#1D1D1F';
const appleSubtext = '#86868B';

export default function FaqPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [site, setSite] = useState<SiteInfo>({ site_name: '甜甜发卡', site_logo: '' });
  useEffect(() => {
    fetch(`${API_BASE}/faq.php`).then(r => r.json()).then(d => { if (d.code === 0 && d.data) setFaqs(d.data); }).catch(() => {});
    fetch(`${API_BASE}/site.php`, { cache: 'no-store' }).then(r => r.json()).then(d => { if (d.data) setSite(d.data); }).catch(() => {});
  }, []);
  const defaultFaqs: Faq[] = [
    { id: 1, question: '付款后多久能收到卡密？', answer: '支付成功后系统自动发货，通常1-5秒内即可在订单查询页面看到卡密。', sort: 1 },
    { id: 2, question: '卡密怎么使用？', answer: '支付成功后会在卡密下方显示兑换教程和使用链接，请按照说明操作。', sort: 2 },
    { id: 3, question: '买错了可以退款吗？', answer: '虚拟商品一经售出概不退款。请在购买前仔细阅读商品描述。', sort: 3 },
    { id: 4, question: '订单号忘了怎么办？', answer: '可通过下单时填写的联系方式联系客服查询，建议保存好订单号。', sort: 4 },
  ];
  const list = faqs.length > 0 ? faqs : defaultFaqs;
  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      <Navbar buttonText="返回首页" buttonHref="/" />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '88px 20px 36px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 24px', textAlign: 'center', letterSpacing: -0.8 }}>常见问题</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((f) => (
            <div key={f.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div onClick={() => setOpenId(openId === f.id ? null : f.id)} style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}>
                <span>{f.question}</span>
                <span style={{ color: appleSubtext, transition: '.3s', transform: openId === f.id ? 'rotate(180deg)' : 'none', fontSize: 12 }}>▼</span>
              </div>
              {openId === f.id && <div style={{ padding: '0 18px 16px', fontSize: 13, color: appleSubtext, lineHeight: 1.7, borderTop: '1px solid #F2F2F7', paddingTop: 12 }}>{f.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
