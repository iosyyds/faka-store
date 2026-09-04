'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';

interface OrderInfo {
  order_no: string; product_name: string; spec_name: string; quantity: number; total_amount: string;
  status: number; paid_at: string | null; created_at: string; cards: { content: string }[]; contact: string;
}

function genCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function QueryPage() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(genCaptcha());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);

  const appleBlue = '#007AFF';
  const appleGray = '#F2F2F7';
  const appleText = '#1D1D1F';
  const appleSubtext = '#86868B';

  const refreshCaptcha = () => { setCaptcha(genCaptcha()); setCaptchaInput(''); };

  async function handleQuery() {
    if (!orderNo.trim()) { setErr('请输入订单号'); return; }
    if (!captchaInput.trim()) { setErr('请输入验证码'); return; }
    if (parseInt(captchaInput) !== captcha.answer) { setErr('验证码错误'); refreshCaptcha(); return; }
    setLoading(true); setErr(''); setOrder(null);
    try {
      const res = await fetch(`${API_BASE}/order_query.php?order_no=${encodeURIComponent(orderNo.trim())}`);
      const data = await res.json();
      if (data.code === 0 && data.data) setOrder(data.data);
      else setErr(data.msg || '查询失败');
    } catch { setErr('查询失败，请重试'); }
    finally { setLoading(false); refreshCaptcha(); }
  }

  function copy(text: string) { navigator.clipboard?.writeText(text).catch(() => {}); }

  const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: '待支付', color: '#FF9500' },
    1: { label: '已完成', color: '#34C759' },
    2: { label: '已取消', color: appleSubtext },
    3: { label: '已退款', color: '#FF3B30' },
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', background: '#fff', borderRadius: 10, fontSize: 13, outline: 'none', letterSpacing: -0.1 };

  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: appleText }}>
      {/* Apple 毛玻璃导航 */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#007AFF,#5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>甜</div>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>甜甜发卡</span>
          </div>
          <button onClick={() => router.push('/')} style={{ padding: '7px 16px', borderRadius: 20, background: appleGray, color: appleText, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: '.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#E8E8ED')} onMouseLeave={(e) => (e.currentTarget.style.background = appleGray)}>返回首页</button>
        </div>
      </nav>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 20px' }}>
        {/* 查询卡片 - Apple 风格 */}
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
            <input type="text" placeholder="FK 开头的订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>验证码</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="text" placeholder="请输入计算结果" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
              <div onClick={refreshCaptcha} style={{ minWidth: 88, height: 38, background: 'linear-gradient(135deg,#F2F2F7,#E8E8ED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: appleBlue, cursor: 'pointer', letterSpacing: 1, userSelect: 'none', transition: '.2s' }} title="点击刷新">{captcha.a} + {captcha.b} = ?</div>
            </div>
          </div>

          {err && <div style={{ color: '#FF3B30', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{err}</div>}

          <button onClick={handleQuery} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 3px 10px rgba(0,122,255,0.25)', letterSpacing: -0.2, transition: '.2s' }} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(1.01)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
            {loading ? '查询中...' : '立即查询'}
          </button>
        </div>

        {/* 查询结果 */}
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
                    <button onClick={() => copy(c.content)} style={{ padding: '5px 12px', background: appleBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>复制</button>
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
