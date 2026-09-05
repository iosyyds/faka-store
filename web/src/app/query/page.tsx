'use client';
import { useState, useRef, useEffect } from 'react';

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
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
    setLoaded(true);
    setIsMobile(window.innerWidth < 768);
    setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    fetch(`${API_BASE}/site.php`, { cache: 'no-store' }).then(r => r.json()).then(d => {
      const data = d?.data && typeof d.data === 'object' ? d.data : d && typeof d === 'object' ? d : {};
      setSite(data);
    }).catch(() => {});
  }, []);

  useEffect(() => { drawCaptcha(); }, [captchaText, loaded]);

  function drawCaptcha() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    const blues = ['#007AFF', '#5856D6', '#00C7BE', '#34C759'];
    for (let i = 0; i < captchaText.length; i++) {
      ctx.save();
      ctx.font = `bold 22px -apple-system, "SF Pro Display", sans-serif`;
      ctx.fillStyle = blues[Math.floor(Math.random() * blues.length)];
      const x = 12 + i * 20;
      const y = 27 + Math.random() * 4 - 2;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.2);
      ctx.fillText(captchaText[i], 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = `rgba(0,122,255,${Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const refreshCaptcha = () => { setCaptchaText(genCaptchaText()); setCaptchaInput(''); };

  async function handleQuery() {
    if (!orderNo.trim()) { setErr('请输入订单号'); return; }
    if (!captchaInput.trim()) { setErr('请输入验证码'); return; }
    if (captchaInput.trim().toUpperCase() !== captchaText) { setErr('验证码错误，请重新输入'); refreshCaptcha(); return; }
    setLoading(true); setErr(''); setOrder(null);
    try {
      const res = await fetch(`${API_BASE}/order_query.php?order_no=${encodeURIComponent(orderNo.trim())}`);
      const data = await res.json();
      if (data.code === 0 && data.data) setOrder(data.data);
      else setErr(data.msg || '查询失败，请检查订单号是否正确');
    } catch { setErr('网络异常，请稍后重试'); }
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

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #E5E5EA', background: '#fff', borderRadius: 10, fontSize: 13, outline: 'none', height: 38, boxSizing: 'border-box', color: appleText, transition: 'all 0.2s ease' };

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: appleSubtext, fontSize: 14 }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      {/* 微信提示 */}
      {isWechat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"></path><path d="M7 7h10v10"></path></svg>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>右上角</span>
          </div>
          <div style={{ width: 72, height: 72, marginBottom: 24, borderRadius: 20, background: 'linear-gradient(135deg,#07C160,#06AD56)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(7,193,96,0.4)' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 }}>请在浏览器中打开</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center', lineHeight: 1.7, maxWidth: 300 }}>
            微信内无法正常使用支付功能<br/>
            点击右上角「···」<br/>
            选择「在浏览器打开」即可正常访问
          </div>
        </div>
      )}

      {/* 导航栏 - 与首页完全一致 */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '0 16px' : '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: '100%' }} onClick={() => { window.location.href = '/'; }}>
            <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1, height: 20, display: 'flex', alignItems: 'center' }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={() => { window.location.href = '/'; }} style={{ width: 80, height: 32, padding: 0, borderRadius: 980, background: '#007AFF', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回首页</button>
        </div>
      </nav>

      {/* 主内容 */}
      <div style={{ maxWidth: 440, margin: '0 auto', padding: isMobile ? '32px 16px 40px' : '48px 22px 64px' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 20 : 28, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 14, background: 'linear-gradient(135deg,#007AFF,#5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,122,255,0.25)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>订单查询</h2>
            <p style={{ fontSize: 13, color: appleSubtext, margin: 0 }}>输入订单号和验证码查看卡密</p>
          </div>

          {/* 错误提示 - Apple 风格 */}
          {err && (
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(255,59,48,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span style={{ fontSize: 13, color: '#FF3B30', fontWeight: 500 }}>{err}</span>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 8 }}>订单号</label>
            <input type="text" placeholder="请输入订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 8 }}>验证码</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="text" placeholder="请输入验证码" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} maxLength={4} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
              <canvas ref={canvasRef} width={90} height={38} onClick={refreshCaptcha} style={{ borderRadius: 10, cursor: 'pointer', border: '1px solid #E5E5EA', height: 38, flexShrink: 0, boxSizing: 'border-box' }} title="点击刷新" />
            </div>
          </div>
          <button onClick={handleQuery} disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 2px 8px rgba(0,122,255,0.2)', transition: 'all 0.2s ease', transform: 'scale(1)' }} onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
            {loading ? '查询中...' : '立即查询'}
          </button>
        </div>

        {/* 查询结果 */}
        {order && (
          <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 20 : 24, marginTop: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F2F2F7' }}>
              <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.2 }}>{order.product_name}</span>
              <span style={{ padding: '5px 14px', borderRadius: 980, fontSize: 12, fontWeight: 600, background: statusMap[order.status]?.color + '15', color: statusMap[order.status]?.color }}>{statusMap[order.status]?.label}</span>
            </div>
            <div style={{ fontSize: 13, color: appleSubtext, marginBottom: 6 }}>订单号：<span style={{ color: appleText, fontFamily: 'monospace' }}>{order.order_no}</span></div>
            <div style={{ fontSize: 13, color: appleSubtext, marginBottom: 6 }}>数量：{order.quantity} · 金额：<span style={{ color: '#FF3B30', fontWeight: 600 }}>¥{order.total_amount}</span></div>
            <div style={{ fontSize: 13, color: appleSubtext, marginBottom: 16 }}>下单时间：{order.created_at}</div>

            {/* 卡密列表 */}
            {order.status === 1 && Array.isArray(order.cards) && order.cards.length > 0 && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                    <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
                  </svg>
                  卡密 ({order.cards.length}条)
                </div>
                {order.cards.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: appleGray, borderRadius: 12, marginBottom: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: appleBlue, color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all', color: appleText }}>{c.content}</span>
                    <button onClick={() => copy(c.content, i)} style={{ padding: '6px 14px', background: copiedIdx === i ? '#34C759' : appleBlue, color: '#fff', border: 'none', borderRadius: 980, fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0, transition: 'all .2s', minWidth: 56 }}>{copiedIdx === i ? '已复制' : '复制'}</button>
                  </div>
                ))}
                {/* 复制成功提示 */}
                {copiedIdx !== null && (
                  <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(52,199,89,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#34C759', fontWeight: 500 }}>卡密已复制到剪贴板</span>
                  </div>
                )}
              </div>
            )}

            {/* 待支付提示 */}
            {order.status === 0 && (
              <div style={{ padding: '12px 14px', background: 'rgba(255,149,0,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span style={{ fontSize: 13, color: '#FF9500', fontWeight: 500 }}>订单待支付，请尽快完成付款</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
