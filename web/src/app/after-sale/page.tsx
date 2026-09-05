'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';
const appleBlue = '#007AFF';
const appleGray = '#F2F2F7';
const appleText = '#1D1D1F';
const appleSubtext = '#86868B';

export default function AfterSalePage() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState('');
  const [contact, setContact] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleSubmit() {
    if (!orderNo.trim()) { setErr('请输入订单号'); return; }
    if (!contact.trim()) { setErr('请输入联系方式'); return; }
    if (!desc.trim()) { setErr('请描述问题'); return; }
    setSubmitting(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${API_BASE}/after_sale.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_no: orderNo.trim(), contact: contact.trim(), description: desc.trim() }) });
      const data = await res.json();
      if (data.code === 0) { setMsg('提交成功，客服会尽快处理'); setOrderNo(''); setContact(''); setDesc(''); }
      else setErr(data.msg || '提交失败');
    } catch { setErr('提交失败，请重试'); }
    finally { setSubmitting(false); }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: 'none', background: appleGray, borderRadius: 12, fontSize: 14, outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" alt="logo" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>甜甜发卡</span>
          </div>
          <button onClick={() => router.push('/')} style={{ padding: '7px 16px', borderRadius: 20, background: appleGray, color: appleText, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>返回首页</button>
        </div>
      </nav>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 14, background: 'linear-gradient(135deg,#FF9500,#FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(255,59,48,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>售后反馈</h2>
            <p style={{ fontSize: 13, color: appleSubtext, margin: 0 }}>如遇卡密无效、商品问题，请填写以下信息</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>订单号 *</label>
            <input type="text" placeholder="FK 开头的订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} style={inputStyle} onFocus={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,122,255,0.3)'; }} onBlur={(e) => { e.currentTarget.style.background = appleGray; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>联系方式 *</label>
            <input type="text" placeholder="QQ / 微信 / 手机号" value={contact} onChange={(e) => setContact(e.target.value)} style={inputStyle} onFocus={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,122,255,0.3)'; }} onBlur={(e) => { e.currentTarget.style.background = appleGray; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>问题描述 *</label>
            <textarea placeholder="请详细描述您遇到的问题..." value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,122,255,0.3)'; }} onBlur={(e) => { e.currentTarget.style.background = appleGray; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          {err && <div style={{ color: '#FF3B30', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{err}</div>}
          {msg && <div style={{ color: '#34C759', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{msg}</div>}
          <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: appleBlue, color: '#fff', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(0,122,255,0.3)' }}>{submitting ? '提交中...' : '提交反馈'}</button>
        </div>
      </div>
    </div>
  );
}
