'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://kk.qqqi.top/api';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string, icon?: string}[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [site, setSite] = useState<any>({});
  const [showBuy, setShowBuy] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [contact, setContact] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [qrCode, setQrCode] = useState('');
  const [polling, setPolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWechat, setIsWechat] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  useEffect(() => {
    setLoaded(true);
    setIsMobile(window.innerWidth < 768);
    setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    fetch(`${API_BASE}/site.php`).then(r => r.json()).then(d => setSite(d?.data && typeof d.data === 'object' ? d.data : d && typeof d === 'object' ? d : {})).catch(() => {});
    fetch(`${API_BASE}/products.php`).then(r => r.json()).then(d => {
      const list = Array.isArray(d?.data?.list) ? d.data.list : Array.isArray(d?.data) ? d.data : Array.isArray(d?.products) ? d.products : Array.isArray(d?.list) ? d.list : Array.isArray(d) ? d : [];
      setProducts(list);
    }).catch(() => {});
    fetch(`${API_BASE}/categories.php`).then(r => r.json()).then(d => {
      const cats = Array.isArray(d?.data) ? d.data.filter((c: any) => c && c.name) : [];
      setCategories(cats);
    }).catch(() => {});
  }, [loaded]);

  const filteredProducts = Array.isArray(products) ? (activeCategory === 'all' ? products : products.filter(p => String(p?.category_id) === String(activeCategory))) : [];

  const openBuy = (p: any) => {
    setSelectedProduct(p);
    setQuantity(1);
    setContact('');
    setOrderResult(null);
    setQrCode('');
    setPolling(false);
    setShowBuy(true);
  };

  const closeModal = () => {
    if (polling) return;
    setShowBuy(false);
    setOrderResult(null);
    setQrCode('');
    setPolling(false);
  };

  const goQuery = () => { window.location.href = '/query'; };
  const goHome = () => { window.location.href = '/'; };

  const pollOrder = useCallback((orderId: string) => {
    let count = 0;
    const timer = setInterval(() => {
      count++;
      if (count > 60) { clearInterval(timer); setPolling(false); return; }
      fetch(`${API_BASE}/order_query.php?order_no=${orderId}&contact=${encodeURIComponent(contact)}`).then(r => r.json()).then(data => {
        const order = data.data || data.order || data;
        if (order.status === 'paid' || order.status === 1 || order.status === 'success') {
          clearInterval(timer);
          setPolling(false);
          setOrderResult((prev: any) => ({ ...prev, ...order, cards: Array.isArray(order.cards) ? order.cards : [] }));
        }
      }).catch(() => {});
    }, 2000);
  }, [contact]);

  const handleBuy = () => {
    if (!contact.trim()) { showToast('请填写手机号'); return; }
    setOrdering(true);
    fetch(`${API_BASE}/order_create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: selectedProduct.id, quantity, contact, pay_method: 'alipay' })
    }).then(r => r.json()).then(data => {
      if (data.code === 0 || data.code === 200 || data.success) {
        const order = data.data || data.order || data;
        setOrderResult(order);
        if (order.qr_code || order.qrcode || order.code_url) {
          setQrCode(order.qr_code || order.qrcode || order.code_url);
        }
        setPolling(true);
        pollOrder(order.order_no || order.order_id || order.id);
      } else {
        showToast(data.msg || data.message || '下单失败');
      }
    }).catch(() => alert('网络错误，请重试')).finally(() => setOrdering(false));
  };

  const copyCard = (text: string, idx: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500); }).catch(() => {});
    }
  };

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#86868B', fontSize: 14 }}>加载中...</div></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}>
      {/* 微信提示 */}
      {isWechat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 24, right: 28, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, animation: 'bounce 1s infinite' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"></path><path d="M7 7h10v10"></path></svg>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>点击右上角</span>
          </div>
          <div style={{ width: 84, height: 84, marginBottom: 28, borderRadius: 24, background: 'linear-gradient(135deg,#07C160,#06AD56)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(7,193,96,0.5)', animation: 'pulse 2s infinite' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
          </div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 14, textAlign: 'center', letterSpacing: -0.5, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>请在浏览器中打开</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, textAlign: 'center', lineHeight: 1.8, maxWidth: 320, marginBottom: 32 }}>
            微信内无法正常使用支付功能<br/>
            点击右上角「···」菜单<br/>
            选择「在浏览器打开」即可正常访问
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 980, fontSize: 12, color: '#fff', fontWeight: 500, backdropFilter: 'blur(10px)' }}>🔒 安全支付</div>
            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 980, fontSize: 12, color: '#fff', fontWeight: 500, backdropFilter: 'blur(10px)' }}>⚡ 自动秒发</div>
            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 980, fontSize: 12, color: '#fff', fontWeight: 500, backdropFilter: 'blur(10px)' }}>🎫 卡密加密</div>
          </div>
          <button onClick={() => setIsWechat(false)} style={{ marginTop: 32, padding: '10px 28px', borderRadius: 980, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>我知道了</button>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes pulse { 0%, 100% { box-shadow: 0 12px 40px rgba(7,193,96,0.5); } 50% { box-shadow: 0 12px 60px rgba(7,193,96,0.8); } }
          `}</style>
        </div>
      )}

      {/* 导航栏 */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '0 16px' : '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: '100%' }} onClick={goHome}>
            <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1, height: 20, display: 'flex', alignItems: 'center' }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={goQuery} style={{ padding: '7px 16px', borderRadius: 980, background: '#007AFF', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>订单查询</button>
        </div>
      </nav>

      {/* 主内容 */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '20px 14px 32px' : '40px 22px 56px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 36 }}>
          <h1 style={{ fontSize: isMobile ? 26 : 44, fontWeight: 700, marginBottom: 8, lineHeight: 1.1 }}>{site.banner_title || '虚拟商品，即拍即发。'}</h1>
          <p style={{ fontSize: isMobile ? 13 : 16, color: '#86868B', marginBottom: 16 }}>{site.banner_subtitle || '支付宝安全支付，付款后自动秒发卡密。'}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['自动秒发', '加密存储', '安全支付'].map((t, i) => (
              <span key={i} style={{ padding: '5px 14px', background: '#F5F5F7', borderRadius: 980, fontSize: 12, color: '#1d1d1f', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* 分类 */}
        {Array.isArray(categories) && categories.length > 0 && (
          <div style={{ position: 'relative', marginBottom: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingRight: isMobile ? 30 : 0, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <span onClick={() => setActiveCategory('all')} style={{ padding: '6px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: activeCategory === 'all' ? '#1d1d1f' : '#F5F5F7', color: activeCategory === 'all' ? '#fff' : '#1d1d1f', transition: 'all 0.2s ease', flexShrink: 0 }}>全部</span>
              {categories.map((cat) => (
                <span key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '6px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: activeCategory === cat.id ? '#1d1d1f' : '#F5F5F7', color: activeCategory === cat.id ? '#fff' : '#1d1d1f', transition: 'all 0.2s ease', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {cat.icon && <span style={{ fontSize: 14 }}>{cat.icon}</span>}
                  {cat.name}
                </span>
              ))}
            </div>
            {isMobile && categories.length > 3 && (
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 4, width: 30, background: 'linear-gradient(to right, transparent, #fff)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86868B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ marginRight: 4 }}>
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            )}
          </div>
        )}

        {/* 商品列表 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? 10 : 14, padding: isMobile ? '0 4px' : 0 }}>
          {filteredProducts.map((p) => {
            const isSoldOut = Number(p.stock) === 0;
            return (
            <div key={p.id} onClick={() => { if (isSoldOut) { showToast('该商品已缺货'); } else { openBuy(p); } }} onMouseEnter={() => !isSoldOut && setHoveredProduct(p.id)} onMouseLeave={() => setHoveredProduct(null)} style={{
              background: '#fff', borderRadius: isMobile ? 14 : 16, cursor: isSoldOut ? 'not-allowed' : 'pointer',
              opacity: isSoldOut ? 0.55 : 1,
              border: isMobile ? '1px solid rgba(0,0,0,0.08)' : (hoveredProduct === p.id ? '1px solid rgba(0,122,255,0.25)' : '1px solid rgba(0,0,0,0.08)'),
              boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.04)' : (hoveredProduct === p.id ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)'),
              padding: isMobile ? '12px 14px' : '16px',
              display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 12 : 0, alignItems: isMobile ? 'center' : 'stretch',
              transform: isMobile || isSoldOut ? 'none' : (hoveredProduct === p.id ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)'),
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: isMobile ? 4 : 8, flexWrap: 'wrap' }}>
                  {p.tags && Array.isArray(p.tags) ? p.tags.map((tag: any, i: number) => (
                    <span key={i} style={{ padding: '2px 7px', background: tag.bg || '#F5F5F7', borderRadius: 5, fontSize: 10, fontWeight: 600, color: tag.color || '#34C759' }}>{tag.text || tag.name}</span>
                  )) : (
                    <>
                      <span style={{ padding: '2px 7px', background: '#F5F5F7', borderRadius: 5, fontSize: 10, fontWeight: 600, color: '#34C759' }}>秒发</span>
                      {p.is_hot && p.is_hot !== '0' && <span style={{ padding: '2px 7px', background: '#F5F5F7', borderRadius: 5, fontSize: 10, fontWeight: 600, color: '#FF3B30' }}>热门</span>}
                    </>
                  )}
                </div>
                <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, marginBottom: isMobile ? 3 : 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, color: p.stock === 0 ? '#86868B' : '#1d1d1f' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: '#FF3B30' }}><span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 600 }}>¥</span>{Number(p.price).toFixed(2)}</span>
                  {isMobile && <span style={{ fontSize: 10, color: '#86868B' }}>已售{p.sales || 0}</span>}
                </div>
                {!isMobile && <div style={{ fontSize: 11, color: '#86868B', marginTop: 6 }}>已售 {p.sales || 0} 件 · {p.stock > 0 ? `库存 ${p.stock}` : '已售罄'}</div>}
              </div>
              {isMobile ? (
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ padding: '6px 14px', borderRadius: 980, background: p.stock > 0 ? '#007AFF' : '#F2F2F7', color: p.stock > 0 ? '#fff' : '#86868B', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.stock > 0 ? '购买' : '缺货'}</span>
                  <span style={{ fontSize: 10, color: p.stock > 0 ? '#34C759' : '#FF3B30', fontWeight: 500 }}>{p.stock > 0 ? `剩${p.stock}件` : '无货'}</span>
                </div>
              ) : (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ padding: '6px 16px', borderRadius: 980, background: p.stock > 0 ? '#007AFF' : '#F2F2F7', color: p.stock > 0 ? '#fff' : '#86868B', fontSize: 12, fontWeight: 600, transition: 'all 0.2s ease', transform: hoveredProduct === p.id ? 'scale(1.05)' : 'scale(1)' }}>{p.stock > 0 ? '立即购买' : '缺货'}</span>
                </div>
              )}
            </div>
          )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#86868B' }}>
            <div style={{ marginBottom: 12, opacity: 0.3 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <div style={{ fontSize: 14 }}>该分类暂无商品</div>
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer style={{ borderTop: '1px solid #D2D2D7', background: '#F5F5F7' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '24px 16px 20px' : '32px 22px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr', gap: isMobile ? 20 : 40, marginBottom: isMobile ? 20 : 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <img src="/logo.png" alt="logo" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', display: 'block' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{site.site_name || '甜甜发卡'}</span>
              </div>
              <p style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.6, maxWidth: 280, margin: 0 }}>{site.footer_desc || '专业的虚拟商品自动发卡平台，支付宝安全支付，付款后自动秒发卡密，24小时无人值守。'}</p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>快速链接</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <a href="/" style={{ fontSize: 12, color: '#6E6E73' }}>首页</a>
                <a href="/query" style={{ fontSize: 12, color: '#6E6E73' }}>订单查询</a>
                <a href="/faq" style={{ fontSize: 12, color: '#6E6E73' }}>常见问题</a>
                <a href="/after-sale" style={{ fontSize: 12, color: '#6E6E73' }}>售后反馈</a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>联系我们</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {site.customer_service && <div style={{ fontSize: 12, color: '#6E6E73' }}>客服：{site.customer_service}</div>}
                {site.qq_group && <div style={{ fontSize: 12, color: '#6E6E73' }}>QQ群：{site.qq_group}</div>}
                <div style={{ fontSize: 12, color: '#6E6E73' }}>支付方式：支付宝</div>
                <div style={{ fontSize: 12, color: '#6E6E73' }}>工作时间：24小时自动发货</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #D2D2D7', paddingTop: 14, display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#86868B' }}>© {new Date().getFullYear()} {site.site_name || '甜甜发卡'}</div>
            <div style={{ fontSize: 11, color: '#86868B' }}>{site.icp_number || ''} 虚拟商品自动发卡平台</div>
          </div>
        </div>
      </footer>

      {/* 购买弹窗 */}
      {showBuy && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, maxHeight: '88vh', overflowY: 'auto', animation: 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{orderResult ? '订单详情' : '确认购买'}</div>
              <span onClick={closeModal} style={{ cursor: 'pointer', color: '#86868B', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#F2F2F7', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E5EA'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#F2F2F7'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </span>
            </div>
            <div style={{ padding: 20 }}>
              {/* 支付中 */}
              {qrCode && !orderResult?.cards && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 180, height: 180, margin: '0 auto 16px', padding: 12, background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="支付二维码" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#F2F2F7', borderRadius: 980, fontSize: 13, color: '#007AFF', marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#007AFF' }}></span>等待支付中...
                  </div>
                  <div style={{ fontSize: 13, color: '#86868B', marginBottom: 16 }}>订单号：{orderResult?.order_no || ''}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>¥{Number(selectedProduct.price * quantity).toFixed(2)}</div>
                  <a href={qrCode} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#1677FF', color: '#fff', borderRadius: 980, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s ease' }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                    <img src="/alipay-icon.png" alt="支付宝" style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover', display: 'block' }} />
                    打开支付宝支付
                  </a>
                </div>
              )}
              {/* 支付成功 */}
              {Array.isArray(orderResult?.cards) && orderResult.cards.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>支付成功</div>
                  <div style={{ fontSize: 13, color: '#86868B', marginBottom: 16 }}>卡密已自动发送，请妥善保管</div>
                  <div style={{ textAlign: 'left', marginBottom: 16 }}>
                    {orderResult.cards.map((c: any, i: number) => (
                      <div key={i} style={{ padding: '10px 12px', background: '#F5F5F7', borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#007AFF', wordBreak: 'break-all', flex: 1 }}>{typeof c === 'string' ? c : c.content}</span>
                        <button onClick={() => copyCard(typeof c === 'string' ? c : c.content, i)} style={{ padding: '5px 12px', background: copiedIdx === i ? '#34C759' : '#007AFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>{copiedIdx === i ? '已复制' : '复制'}</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#F2F2F7', color: '#1d1d1f', fontSize: 13, cursor: 'pointer' }}>关闭</button>
                    <button onClick={goQuery} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#007AFF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>订单查询</button>
                  </div>
                </div>
              )}
              {/* 购买表单 */}
              {!qrCode && !orderResult?.cards && (
                <>
                  <div style={{ padding: 12, background: '#F5F5F7', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#E8E8ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                        <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: 12, color: '#86868B' }}>库存 {selectedProduct.stock} 件</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#FF3B30' }}>¥{Number(selectedProduct.price).toFixed(2)}</div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>联系方式</div>
                    <input type="tel" placeholder="请输入手机号" value={contact} onChange={(e) => setContact(e.target.value.replace(/[^0-9]/g, ''))} maxLength={11} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E5EA', background: '#fff', borderRadius: 10, fontSize: 13, outline: 'none', height: 38, boxSizing: 'border-box', transition: 'all 0.2s ease' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>购买数量</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 36, border: '1px solid #E5E5EA', borderRight: 'none', background: '#F5F5F7', borderRadius: '10px 0 0 10px', cursor: 'pointer', fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontSize: 16, fontWeight: 600, minWidth: 48, height: 36, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5EA', background: '#fff' }}>{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} style={{ width: 36, height: 36, border: '1px solid #E5E5EA', borderLeft: 'none', background: '#F5F5F7', borderRadius: '0 10px 10px 0', cursor: 'pointer', fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F5F5F7', borderRadius: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 14, color: '#86868B' }}>合计</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#FF3B30' }}>¥{Number(selectedProduct.price * quantity).toFixed(2)}</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>支付方式</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px solid #007AFF', borderRadius: 12, background: 'rgba(0,122,255,0.04)', transition: 'all 0.2s ease' }}>
                      <img src="/alipay-icon.png" alt="支付宝" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>支付宝</span>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#007AFF' }}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #E5E5EA', background: '#fff', color: '#1d1d1f', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>取消</button>
                    <button onClick={handleBuy} disabled={ordering || selectedProduct.stock <= 0} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: '#007AFF', color: '#fff', fontSize: 14, fontWeight: 600, cursor: ordering ? 'not-allowed' : 'pointer', opacity: ordering ? 0.6 : 1, transition: 'all 0.2s ease' }} onMouseDown={(e) => { if (!ordering) e.currentTarget.style.transform = 'scale(0.97)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>{ordering ? '处理中...' : '立即支付'}</button>
                  </div>
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, fontSize: 11, color: '#34C759', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    支付成功后自动发货，卡密可在订单查询中查看
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toast && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 500, backdropFilter: 'blur(10px)', animation: 'fadeIn 0.2s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
