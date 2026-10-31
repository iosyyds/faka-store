'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const API_BASE = 'https://api.puaaa.cn/api';
const appleBlue = '#007AFF';
const appleText = '#1D1D1F';
const appleSubtext = '#86868B';

interface WarrantyInfo {
  udid: string; sign_code: string; customer: string; start_date: string;
  duration_days: number; remain_days: number; status: string; status_label: string; remark: string;
}

export default function WarrantyPage() {
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 查询
  const [queryUdid, setQueryUdid] = useState('');
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<WarrantyInfo | null>(null);
  const [queryErr, setQueryErr] = useState('');

  // 登记
  const [udid, setUdid] = useState('');
  const [signCode, setSignCode] = useState('');
  const [customer, setCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('365');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoaded(true);
    setIsMobile(window.innerWidth < 768);
    setStartDate(new Date().toISOString().slice(0, 10));
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #E5E5EA', background: '#fff',
    borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: appleText,
    transition: 'all 0.2s ease',
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = appleBlue;
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#E5E5EA';
    e.currentTarget.style.boxShadow = 'none';
  };

  async function handleQuery() {
    if (!queryUdid.trim()) { setQueryErr('请输入UDID'); return; }
    setQuerying(true); setQueryErr(''); setQueryResult(null);
    try {
      const res = await fetch(`${API_BASE}/warranty_query.php?udid=${encodeURIComponent(queryUdid.trim())}`);
      const data = await res.json();
      if (data.code === 0 && data.data) setQueryResult(data.data);
      else setQueryErr(data.msg || '未查询到记录');
    } catch { setQueryErr('网络异常，请稍后重试'); }
    finally { setQuerying(false); }
  }

  async function handleSubmit() {
    if (!udid.trim()) { setErr('请填写 UDID'); return; }
    if (!signCode.trim()) { setErr('请填写签名码'); return; }
    if (!startDate) { setErr('请选择下单时间'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API_BASE}/warranty_add.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          udid: udid.trim(),
          sign_code: signCode.trim(),
          customer: customer.trim(),
          start_date: startDate,
          duration_days: parseInt(duration) || 365,
          remark: remark.trim(),
        }),
      });
      const data = await res.json();
      if (data.code === 0) setDone(true);
      else setErr(data.msg || '提交失败，请稍后重试');
    } catch { setErr('网络异常，请稍后重试'); }
    finally { setLoading(false); }
  }

  function statusColor(s: string) {
    switch (s) {
      case 'active': return '#34C759';
      case 'normal': return '#FF9500';
      case 'urgent': return '#FF3B30';
      default: return '#86868B';
    }
  }

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: appleSubtext, fontSize: 14 }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      <Navbar primaryText="返回首页" primaryHref="/" secondaryText="订单查询" secondaryHref="/query" />

      <div style={{ maxWidth: 440, margin: '0 auto', padding: isMobile ? '82px 16px 40px' : '92px 22px 64px' }}>

        {/* 质保查询 */}
        <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 20 : 24, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,122,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={appleBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>质保查询</div>
              <div style={{ fontSize: 12, color: appleSubtext }}>输入UDID查询剩余质保天数</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="输入设备UDID" value={queryUdid} onChange={(e) => setQueryUdid(e.target.value)}
              style={{ ...inputStyle, flex: 1 }} onFocus={focusStyle} onBlur={blurStyle}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()} />
            <button onClick={handleQuery} disabled={querying}
              style={{ padding: '0 20px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: querying ? 'not-allowed' : 'pointer', opacity: querying ? 0.6 : 1 }}>
              {querying ? '查询中' : '查询'}
            </button>
          </div>
          {queryErr && <div style={{ marginTop: 10, fontSize: 13, color: '#FF3B30' }}>{queryErr}</div>}

          {queryResult && (
            <div style={{ marginTop: 14, padding: 14, background: '#F5F5F7', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: appleSubtext }}>剩余质保</span>
                <span style={{ padding: '4px 12px', borderRadius: 980, fontSize: 13, fontWeight: 700, color: '#fff', background: statusColor(queryResult.status) }}>
                  {queryResult.remain_days >= 0 ? `剩 ${queryResult.remain_days} 天` : '已过期'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: appleSubtext, lineHeight: 1.8 }}>
                <div>开始时间：{queryResult.start_date}</div>
                <div>质保时长：{queryResult.duration_days} 天</div>
                <div>当前状态：{queryResult.status_label}</div>
              </div>
            </div>
          )}
        </div>

        {/* 登记表单 */}
        {done ? (
          <div style={{ background: '#fff', borderRadius: 18, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>提交成功</h2>
            <p style={{ fontSize: 14, color: appleSubtext, margin: 0, lineHeight: 1.6 }}>质保信息已登记，我们会尽快处理。</p>
            <button onClick={() => setDone(false)} style={{ marginTop: 24, padding: '10px 28px', borderRadius: 980, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>继续登记</button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, padding: isMobile ? 20 : 24, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>质保登记</h2>
              <p style={{ fontSize: 13, color: appleSubtext, margin: 0 }}>填写设备信息完成质保登记</p>
            </div>

            {err && (
              <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(255,59,48,0.08)', borderRadius: 10, fontSize: 13, color: '#FF3B30', fontWeight: 500 }}>{err}</div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>UDID <span style={{ color: '#FF3B30' }}>*</span></label>
              <input placeholder="设备UDID" value={udid} onChange={(e) => setUdid(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>签名码 <span style={{ color: '#FF3B30' }}>*</span></label>
              <input placeholder="签名码" value={signCode} onChange={(e) => setSignCode(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>客户称呼（选填）</label>
              <input placeholder="微信备注/称呼" value={customer} onChange={(e) => setCustomer(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>下单时间 <span style={{ color: '#FF3B30' }}>*</span></label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>质保天数</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="1" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>备注（选填）</label>
              <textarea placeholder="设备情况、问题描述" value={remark} onChange={(e) => setRemark(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? '提交中...' : '提交登记'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
