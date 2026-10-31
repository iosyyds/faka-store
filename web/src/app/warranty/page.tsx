'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const API_BASE = 'https://api.puaaa.cn/api';
const appleBlue = '#007AFF';
const appleText = '#1D1D1F';
const appleSubtext = '#86868B';

export default function WarrantyPage() {
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [udid, setUdid] = useState('');
  const [signCode, setSignCode] = useState('');
  const [customer, setCustomer] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoaded(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #E5E5EA', background: '#fff',
    borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: appleText,
    transition: 'all 0.2s ease',
  };

  async function handleSubmit() {
    if (!udid.trim()) { setErr('请填写 UDID'); return; }
    if (!signCode.trim()) { setErr('请填写签名码'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API_BASE}/warranty_add.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          udid: udid.trim(),
          sign_code: signCode.trim(),
          customer: customer.trim(),
          remark: remark.trim(),
        }),
      });
      const data = await res.json();
      if (data.code === 0) {
        setDone(true);
      } else {
        setErr(data.msg || '提交失败，请稍后重试');
      }
    } catch {
      setErr('网络异常，请稍后重试');
    } finally { setLoading(false); }
  }

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: appleSubtext, fontSize: 14 }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      <Navbar primaryText="返回首页" primaryHref="/" secondaryText="订单查询" secondaryHref="/query" />

      <div style={{ maxWidth: 440, margin: '0 auto', padding: isMobile ? '82px 16px 40px' : '92px 22px 64px' }}>
        {done ? (
          <div style={{ background: '#fff', borderRadius: 18, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>提交成功</h2>
            <p style={{ fontSize: 14, color: appleSubtext, margin: 0, lineHeight: 1.6 }}>质保信息已登记，我们会尽快为您处理。<br/>如有问题请联系客服。</p>
            <button onClick={() => setDone(false)} style={{ marginTop: 24, padding: '10px 28px', borderRadius: 980, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>继续登记</button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 20 : 28, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 14, background: 'linear-gradient(135deg,#007AFF,#5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,122,255,0.25)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>质保登记</h2>
              <p style={{ fontSize: 13, color: appleSubtext, margin: 0 }}>填写设备信息，登记质保售后</p>
            </div>

            {err && (
              <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(255,59,48,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize: 13, color: '#FF3B30', fontWeight: 500 }}>{err}</span>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 8 }}>UDID <span style={{ color: '#FF3B30' }}>*</span></label>
              <input placeholder="请输入设备 UDID" value={udid} onChange={(e) => setUdid(e.target.value)} style={inputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 8 }}>签名码 <span style={{ color: '#FF3B30' }}>*</span></label>
              <input placeholder="请输入签名码" value={signCode} onChange={(e) => setSignCode(e.target.value)} style={inputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 8 }}>客户称呼（选填）</label>
              <input placeholder="微信备注/称呼" value={customer} onChange={(e) => setCustomer(e.target.value)} style={inputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 8 }}>备注（选填）</label>
              <textarea placeholder="设备情况、问题描述等" value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 2px 8px rgba(0,122,255,0.2)', transition: 'all 0.2s ease' }}>
              {loading ? '提交中...' : '提交登记'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
