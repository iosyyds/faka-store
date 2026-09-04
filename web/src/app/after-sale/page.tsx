'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';

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
      const res = await fetch(`${API_BASE}/after_sale.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_no: orderNo.trim(), contact: contact.trim(), description: desc.trim() }),
      });
      const data = await res.json();
      if (data.code === 0) { setMsg('提交成功，客服会尽快处理'); setOrderNo(''); setContact(''); setDesc(''); }
      else setErr(data.msg || '提交失败');
    } catch { setErr('提交失败，请重试'); }
    finally { setSubmitting(false); }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' };

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

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eef0f3', padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>💬 售后反馈</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '0 0 18px' }}>如遇卡密无效、商品问题等，请填写以下信息</p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>订单号 *</label>
            <input type="text" placeholder="FK开头的订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>联系方式 *</label>
            <input type="text" placeholder="QQ / 微信 / 手机号" value={contact} onChange={(e) => setContact(e.target.value)} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>问题描述 *</label>
            <textarea placeholder="请详细描述您遇到的问题..." value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
          </div>

          {err && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{err}</div>}
          {msg && <div style={{ color: '#16a34a', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{msg}</div>}

          <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? '提交中...' : '提交反馈'}
          </button>
        </div>
      </div>

      <footer style={{ background: '#fff', borderTop: '1px solid #eef0f3', marginTop: 40, padding: '24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>© {new Date().getFullYear()} 甜甜发卡 · 虚拟商品自动发卡平台</div>
      </footer>
    </div>
  );
}
