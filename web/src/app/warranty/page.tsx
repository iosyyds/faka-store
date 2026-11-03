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
  const [duration, setDuration] = useState('360');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoaded(true);
    setIsMobile(window.innerWidth < 768);
    setStartDate(new Date().toISOString().slice(0, 10));
    // 检测从获取UDID页面跳回时自动填充
    const params = new URLSearchParams(window.location.search);
    const autoUdid = params.get('udid');
    if (autoUdid) setUdid(autoUdid);
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
          duration_days: parseInt(duration) || 360,
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
      case 'pending': return '#FF9500';
      case 'disabled': return '#86868B';
      case 'expired': return '#86868B';
      default: return '#86868B';
    }
  }

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: appleSubtext, fontSize: 14 }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', color: appleText }}>
      <style>{`input[type="date"]::-webkit-calendar-picker-indicator { display: none; } input[type="date"] { text-align: left; } select { text-align: left; }`}</style>
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
            <div style={{ marginTop: 14, padding: 16, background: '#F5F5F7', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>剩余质保</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#34C759' }}>
                  {queryResult.remain_days} 天
                </span>
              </div>
              <div style={{ fontSize: 12, color: appleSubtext, lineHeight: 1.8, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>开始时间</span>
                  <span style={{ color: appleText, fontWeight: 500 }}>{queryResult.start_date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>质保时长</span>
                  <span style={{ color: appleText, fontWeight: 500 }}>{queryResult.duration_days} 天</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: appleSubtext, marginBottom: 6 }}>
                  <span>已用 {queryResult.duration_days - queryResult.remain_days} 天</span>
                  <span>剩余 {queryResult.remain_days} 天</span>
                </div>
                <div style={{ height: 6, background: '#E5E5EA', borderRadius: 980, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, queryResult.remain_days / queryResult.duration_days * 100))}%`, background: 'linear-gradient(90deg, #34C759, #30D158)', borderRadius: 980, transition: 'width 0.8s ease' }}></div>
                </div>
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
            <p style={{ fontSize: 14, color: appleSubtext, margin: 0, lineHeight: 1.6 }}>质保信息已提交，等待管理员审核。<br/>审核通过后即可查询剩余质保天数。</p>
            <button onClick={() => { setDone(false); setUdid(''); setSignCode(''); setCustomer(''); setRemark(''); setErr(''); setStartDate(new Date().toISOString().slice(0, 10)); setDuration('360'); }} style={{ marginTop: 24, padding: '10px 28px', borderRadius: 980, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>继续登记</button>
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
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="设备UDID" value={udid} onChange={(e) => setUdid(e.target.value)} style={{ ...inputStyle, flex: 1 }} onFocus={focusStyle} onBlur={blurStyle} />
                <a href="https://api.puaaa.cn/api/udid_profile.php" style={{ padding: '0 14px', borderRadius: 12, background: 'rgba(0,122,255,0.1)', color: appleBlue, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>获取UDID</a>
              </div>
              {udid && <div style={{ fontSize: 11, color: '#34C759', marginTop: 4 }}>✓ 已自动填充</div>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>签名码 <span style={{ color: '#FF3B30' }}>*</span></label>
              <input placeholder="签名码" value={signCode} onChange={(e) => setSignCode(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>客户称呼（选填）</label>
              <input placeholder="微信备注/称呼" value={customer} onChange={(e) => setCustomer(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ display: 'flex', marginBottom: 12 }}>
              <div style={{ width: '50%', paddingRight: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>下单时间 <span style={{ color: '#FF3B30' }}>*</span></div>
                <div style={{ position: 'relative' }}>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    style={{ display: 'block', width: '100%', padding: '10px 28px 10px 8px', border: '1px solid #E5E5EA', borderRadius: 12, fontSize: 12, background: '#fff', outline: 'none', boxSizing: 'border-box', color: appleText, WebkitAppearance: 'none', appearance: 'none', textAlign: 'left' }} />
                  <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              </div>
              <div style={{ width: '50%', paddingLeft: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>质保天数 <span style={{ color: '#FF3B30' }}>*</span></div>
                <div style={{ position: 'relative' }}>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)}
                    style={{ display: 'block', width: '100%', padding: '10px 24px 10px 8px', border: '1px solid #E5E5EA', borderRadius: 12, fontSize: 12, background: '#fff', outline: 'none', boxSizing: 'border-box', color: appleText, WebkitAppearance: 'none', appearance: 'none', textAlign: 'left' }}>
                    <option value="45">45天</option>
                    <option value="185">185天</option>
                    <option value="360">360天</option>
                  </select>
                  <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
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
