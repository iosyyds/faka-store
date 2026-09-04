'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';

const API_BASE = 'https://kk.qqqi.top/api';

interface OrderInfo {
  order_no: string; product_name: string; spec_name: string; quantity: number; total_amount: string;
  status: number; paid_at: string | null; created_at: string; cards: { content: string }[]; contact: string;
}

export default function QueryPage() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);

  async function handleQuery() {
    if (!orderNo.trim() || !pwd.trim()) { setErr('请输入订单号和查询密码'); return; }
    setLoading(true); setErr(''); setOrder(null);
    try {
      const res = await fetch(`${API_BASE}/order_query.php?order_no=${encodeURIComponent(orderNo.trim())}&pwd=${encodeURIComponent(pwd.trim())}`);
      const data = await res.json();
      if (data.code === 0 && data.data) setOrder(data.data);
      else setErr(data.msg || '查询失败');
    } catch { setErr('查询失败，请重试'); }
    finally { setLoading(false); }
  }

  function copy(text: string) { navigator.clipboard?.writeText(text).catch(() => {}); }

  const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: '待支付', color: '#d97706' },
    1: { label: '已完成', color: '#059669' },
    2: { label: '已取消', color: '#6b7280' },
    3: { label: '已退款', color: '#dc2626' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav className="nav-responsive">
        <div className="nav-inner-responsive">
          <div className="nav-left-responsive">
            <div className="nav-logo-responsive" onClick={() => router.push('/')}>
              <div className="nav-logo-icon-responsive">甜</div>
              <span className="nav-logo-text-responsive">甜甜发卡</span>
            </div>
          </div>
          <div className="nav-right-responsive">
            <button className="btn-primary-responsive" onClick={() => router.push('/')}>返回首页</button>
          </div>
        </div>
      </nav>

      <div className="container-responsive" style={{ maxWidth: 560 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>🔑 订单查询</h2>
          <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>输入订单号和查询密码，查看订单状态和卡密</p>

          <div className="form-group-responsive">
            <label className="form-label-responsive"><Icon name="file" size={14} style={{ marginRight: 4 }} />订单号</label>
            <div className="input-wrapper-responsive">
              <span className="input-icon-responsive"><Icon name="file" size={16} /></span>
              <input type="text" placeholder="FK开头的订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} className="form-input-with-icon-responsive" />
            </div>
          </div>

          <div className="form-group-responsive">
            <label className="form-label-responsive"><Icon name="key" size={14} style={{ marginRight: 4 }} />查询密码</label>
            <div className="input-wrapper-responsive">
              <span className="input-icon-responsive"><Icon name="key" size={16} /></span>
              <input type="password" placeholder="下单时生成的6位密码" value={pwd} onChange={(e) => setPwd(e.target.value)} className="form-input-with-icon-responsive" onKeyDown={(e) => e.key === 'Enter' && handleQuery()} />
            </div>
          </div>

          {err && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{err}</div>}

          <button className="modal-submit-responsive" style={{ width: '100%', padding: '12px', fontSize: 15 }} onClick={handleQuery} disabled={loading}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span className="btn-spinner-responsive"></span>查询中...</span> : '立即查询'}
          </button>
        </div>

        {order && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>{order.product_name}</span>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusMap[order.status]?.color + '15', color: statusMap[order.status]?.color }}>{statusMap[order.status]?.label}</span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>订单号：{order.order_no}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>数量：{order.quantity} · 金额：<span style={{ color: '#dc2626', fontWeight: 600 }}>¥{order.total_amount}</span></div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>下单时间：{order.created_at}</div>

            {order.status === 1 && order.cards && order.cards.length > 0 && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>🎫 您的卡密 ({order.cards.length}条)</div>
                {order.cards.map((c, i) => (
                  <div key={i} className="card-item-responsive">
                    <span className="card-index-responsive">{i + 1}</span>
                    <span className="card-content-responsive">{c.content}</span>
                    <button className="card-copy-btn-responsive" onClick={() => copy(c.content)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      复制
                    </button>
                  </div>
                ))}
              </div>
            )}
            {order.status === 0 && <div style={{ padding: 14, background: '#fffbeb', borderRadius: 8, fontSize: 13, color: '#d97706' }}>订单待支付，请尽快完成付款</div>}
          </div>
        )}
      </div>
    </div>
  );
}
