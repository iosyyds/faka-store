'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';
const appleBlue = '#007AFF';
const appleGray = '#F2F2F7';
const appleText = '#1D1D1F';
const appleSubtext = '#86868B';

interface OrderInfo {
  order_no: string; product_name: string; spec_name: string; quantity: number; total_amount: string;
  status: number; paid_at: string | null; created_at: string; cards: { content: string }[]; contact: string;
}

interface SiteInfo {
  site_name: string; site_logo: string; customer_service: string; qq_group: string; copyright: string;
}

function genCaptchaText() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function QueryPage() {
  const router = useRouter();
  const [isWechat, setIsWechat] = useState(false);
  const [site, setSite] = useState<SiteInfo>({ site_name: '甜甜发卡', site_logo: '', customer_service: '', qq_group: '', copyright: '' });
  const [orderNo, setOrderNo] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState(genCaptchaText());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    fetch(`${API_BASE}/site.php`, { cache: 'no-store' }).then(r => r.json()).then(d => { if (d.data) setSite(d.data); }).catch(() => {});
  }, []);

  useEffect(() => { drawCaptcha(); }, [captchaText]);

  function drawCaptcha() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#F2F2F7';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random()*100+100},${Math.random()*100+100},${Math.random()*100+100},0.4)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random()*150+50},${Math.random()*150+50},${Math.random()*150+50},0.5)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
    const colors = ['#007AFF', '#5856D6', '#FF2D55', '#34C759', '#FF9500'];
    for (let i = 0; i < captchaText.length; i++) {
      ctx.save();
      ctx.font = `bold ${18 + Math.random() * 4}px -apple-system, sans-serif`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const x = 12 + i * 20;
      const y = 22 + Math.random() * 6 - 3;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(captchaText[i], 0, 0);
      ctx.restore();
    }
  }

  const refreshCaptcha = () => { setCaptchaText(genCaptchaText()); setCaptchaInput(''); };

  async function handleQuery() {
    if (!orderNo.trim()) { setErr('请输入订单号'); return; }
    if (!captchaInput.trim()) { setErr('请输入验证码'); return; }
    if (captchaInput.trim().toUpperCase() !== captchaText) { setErr('验证码错误'); refreshCaptcha(); return; }
    setLoading(true); setErr(''); setOrder(null);
    try {
      const res = await fetch(`${API_BASE}/order_query.php?order_no=${encodeURIComponent(orderNo.trim())}`);
      const data = await res.json();
      if (data.code === 0 && data.data) setOrder(data.data);
      else setErr(data.msg || '查询失败');
    } catch { setErr('查询失败，请重试'); }
    finally { setLoading(false); refreshCaptcha(); }
  }

  function copy(text: string, idx: number) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  }

  const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: '待支付', color: '#FF9500' },
    1: { label: '已完成', color: '#34C759' },
    2: { label: '已取消', color: appleSubtext },
    3: { label: '已退款', color: '#FF3B30' },
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 9px', border: '1px solid #E5E5EA', background: '#fff', borderRadius: 7, fontSize: 12, outline: 'none', height: 30, boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      {isWechat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: 60, height: 60, marginBottom: 20, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#07C160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
          </div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>请在浏览器中打开</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>点击右上角「···」<br/>选择「在浏览器打开」即可正常访问</div>
        </div>
      )}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" alt="logo" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1, display: 'inline-block' }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={() => router.push('/')} style={{ padding: '7px 16px', borderRadius: 20, background: appleGray, color: appleText, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>返回首页</button>
        </div>
      </nav>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 14, background: 'linear-gradient(135deg,#007AFF,#5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,122,255,0.25)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>订单查询</h2>
            <p style={{ fontSize: 13, color: appleSubtext, margin: 0 }}>输入订单号和验证码查看卡密</p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>订单号</label>
            <input type="text" placeholder="请输入订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>验证码</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="text" placeholder="请输入验证码" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} maxLength={4} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
              <canvas ref={canvasRef} width={90} height={30} onClick={refreshCaptcha} style={{ borderRadius: 7, cursor: 'pointer', border: '1px solid #E5E5EA', height: 30, flexShrink: 0, boxSizing: 'border-box' }} title="点击刷新" />
            </div>
          </div>

          {err && <div style={{ color: '#FF3B30', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{err}</div>}

          <button onClick={handleQuery} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 3px 10px rgba(0,122,255,0.25)' }}>
            {loading ? '查询中...' : '立即查询'}
          </button>
        </div>

        {order && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginTop: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.2 }}>{order.product_name}</span>
              <span style={{ padding: '4px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600, background: statusMap[order.status]?.color + '15', color: statusMap[order.status]?.color }}>{statusMap[order.status]?.label}</span>
            </div>
            <div style={{ fontSize: 12, color: appleSubtext, marginBottom: 4 }}>订单号：{order.order_no}</div>
            <div style={{ fontSize: 12, color: appleSubtext, marginBottom: 4 }}>数量：{order.quantity} · 金额：<span style={{ color: '#FF3B30', fontWeight: 600 }}>¥{order.total_amount}</span></div>
            <div style={{ fontSize: 12, color: appleSubtext, marginBottom: 14 }}>下单时间：{order.created_at}</div>
            {order.status === 1 && order.cards && order.cards.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>🎫 卡密 ({order.cards.length}条)</div>
                {order.cards.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: appleGray, borderRadius: 10, marginBottom: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: appleBlue, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{c.content}</span>
                    <button onClick={() => copy(c.content, i)} style={{ padding: '5px 12px', background: copiedIdx === i ? '#34C759' : appleBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0, transition: 'all .2s', minWidth: 44 }}>{copiedIdx === i ? '已复制' : '复制'}</button>
                  </div>
                ))}
              </div>
            )}
            {order.status === 0 && <div style={{ padding: 12, background: 'rgba(255,149,0,0.08)', borderRadius: 10, fontSize: 12, color: '#FF9500', textAlign: 'center' }}>订单待支付，请尽快完成付款</div>}
          </div>
        )}
      </div>
    </div>
  );
}
