'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';

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
    0: { label: '待支付', color: '#d97706' },
    1: { label: '已完成', color: '#059669' },
    2: { label: '已取消', color: '#6b7280' },
    3: { label: '已退款', color: '#dc2626' },
  };

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
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>订单查询</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '0 0 18px' }}>输入订单号和验证码查看卡密</p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>订单号</label>
            <input type="text" placeholder="FK开头的订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>验证码</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" placeholder="请输入计算结果" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
              <div onClick={refreshCaptcha} style={{ minWidth: 90, height: 40, background: 'linear-gradient(135deg,#eff6ff,#ede9fe)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2563eb', cursor: 'pointer', letterSpacing: 2, userSelect: 'none' }} title="点击刷新">{captcha.a} + {captcha.b} = ?</div>
            </div>
          </div>

          {err && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{err}</div>}

          <button onClick={handleQuery} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '查询中...' : '立即查询'}
          </button>
        </div>

        {order && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eef0f3', padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{order.product_name}</span>
              <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: statusMap[order.status]?.color + '15', color: statusMap[order.status]?.color }}>{statusMap[order.status]?.label}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>订单号：{order.order_no}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>数量：{order.quantity} · 金额：<span style={{ color: '#ef4444', fontWeight: 600 }}>¥{order.total_amount}</span></div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>下单时间：{order.created_at}</div>

            {order.status === 1 && order.cards && order.cards.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🎫 卡密 ({order.cards.length}条)</div>
                {order.cards.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{c.content}</span>
                    <button onClick={() => copy(c.content)} style={{ padding: '3px 8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>复制</button>
                  </div>
                ))}
              </div>
            )}
            {order.status === 0 && <div style={{ padding: 10, background: '#fffbeb', borderRadius: 8, fontSize: 12, color: '#d97706' }}>订单待支付，请尽快完成付款</div>}
          </div>
        )}
      </div>
    </div>
  );
}
