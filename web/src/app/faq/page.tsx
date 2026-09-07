'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const API_BASE = 'https://kk.qqqi.top/api';
interface Faq { id: number; question: string; answer: string; sort: number; }
const appleBlue = '#007AFF';
const appleGray = '#F2F2F7';
const appleText = '#1D1D1F';
const appleSubtext = '#86868B';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  useEffect(() => {
    fetch(`${API_BASE}/faq.php`).then(r => r.json()).then(d => { if (d.code === 0 && d.data) setFaqs(d.data); }).catch(() => {});
  }, []);
  const list = faqs;
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      <Navbar buttonText="返回首页" buttonHref="/" />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '92px 22px 36px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 24px', textAlign: 'center', letterSpacing: -0.8 }}>常见问题</h2>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: appleSubtext, fontSize: 14 }}>暂无常见问题</div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
