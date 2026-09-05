'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
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
      if (count > 60) { clearInterval(timer); timerRef.current = null; setPolling(false); return; }
      fetch(`${API_BASE}/order_query.php?order_no=${orderId}&contact=${encodeURIComponent(contact)}`).then(r => r.json()).then(data => {
        const order = data.data || data.order || data;
        if (order.status === 'paid' || order.status === 1 || order.status === 'success') {
          clearInterval(timer);
          timerRef.current = null;
          setPolling(false);
          setOrderResult((prev: any) => ({ ...prev, ...order, cards: Array.isArray(order.cards) ? order.cards : [] }));
        }
      }).catch(() => {});
    }, 2000);
    timerRef.current = timer;
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
      {/* 微信提示 - AppStore 风格 */}
      {isWechat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.25s ease' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px 28px', maxWidth: 360, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', animation: 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            {/* 图标 */}
            <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: 18, background: 'linear-gradient(135deg, #007AFF, #5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,122,255,0.3)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            {/* 标题 */}
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 }}>请在浏览器中打开</div>
            <div style={{ fontSize: 13, color: '#86868B', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>微信内无法正常使用支付功能，请按以下步骤操作</div>
            {/* 步骤 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#F5F5F7', borderRadius: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#007AFF', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                <div style={{ fontSize: 13, color: '#1d1d1f', fontWeight: 500 }}>点击右上角「···」菜单</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#F5F5F7', borderRadius: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#007AFF', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                <div style={{ fontSize: 13, color: '#1d1d1f', fontWeight: 500 }}>选择「在浏览器打开」</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </div>
            </div>
            {/* 提示 - 无关闭按钮，强制去浏览器打开 */}
            <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#F5F5F7', borderRadius: 980, fontSize: 12, color: '#86868B', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                请在浏览器中打开后继续使用
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          `}</style>
        </div>
      )}

      {/* 导航栏 */}
      <Navbar buttonText="订单查询" buttonHref="/query" isMobile={isMobile} />

      {/* 主内容 */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '72px 14px 32px' : '92px 22px 56px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 36 }}>
          <h1 style={{ fontSize: isMobile ? 26 : 44, fontWeight: 700, marginBottom: 8, lineHeight: 1.1 }}>{site.banner_title || '虚拟商品，即拍即发。'}</h1>
          <p style={{ fontSize: isMobile ? 13 : 16, color: '#86868B', marginBottom: 0 }}>{site.banner_subtitle || '支付宝安全支付，付款后自动秒发卡密。'}</p>
        </div>

        {/* 分类 */}
        {Array.isArray(categories) && categories.length > 0 && (
          <div style={{ position: 'relative', marginBottom: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingRight: isMobile ? 30 : 0, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <span onClick={() => setActiveCategory('all')} style={{ padding: '7px 16px', borderRadius: 980, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: activeCategory === 'all' ? '#fff' : '#F5F5F7', color: activeCategory === 'all' ? '#007AFF' : '#1d1d1f', border: activeCategory === 'all' ? '1.5px solid #007AFF' : '1.5px solid transparent', transition: 'all 0.2s ease', flexShrink: 0 }}>全部</span>
              {categories.map((cat) => (
                <span key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '7px 16px', borderRadius: 980, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: activeCategory === cat.id ? '#fff' : '#F5F5F7', color: activeCategory === cat.id ? '#007AFF' : '#1d1d1f', border: activeCategory === cat.id ? '1.5px solid #007AFF' : '1.5px solid transparent', transition: 'all 0.2s ease', flexShrink: 0 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? 8 : 12, padding: isMobile ? '0 4px' : 0 }}>
          {filteredProducts.map((p) => {
            const isSoldOut = Number(p.stock) === 0;
            return (
            <div key={p.id} onClick={() => { if (isSoldOut) { showToast('该商品已缺货'); } else { openBuy(p); } }} onMouseEnter={() => !isSoldOut && setHoveredProduct(p.id)} onMouseLeave={() => setHoveredProduct(null)} style={{
              background: '#fff', borderRadius: isMobile ? 14 : 16, cursor: isSoldOut ? 'not-allowed' : 'pointer',
              opacity: isSoldOut ? 0.55 : 1,
              border: isMobile ? '1px solid rgba(0,0,0,0.08)' : (hoveredProduct === p.id ? '1px solid rgba(0,122,255,0.25)' : '1px solid rgba(0,0,0,0.08)'),
              boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.04)' : (hoveredProduct === p.id ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)'),
              padding: isMobile ? '10px 12px' : '12px 14px',
              display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 12 : 0, alignItems: isMobile ? 'center' : 'stretch',
              transform: isMobile || isSoldOut ? 'none' : (hoveredProduct === p.id ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)'),
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: isMobile ? 2 : 3 }}>
                  {p.is_hot == 1 && <span style={{ padding: '2px 8px', borderRadius: 980, background: 'linear-gradient(135deg, #FF9500, #FF3B30)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>HOT</span>}
                  {p.is_top == 1 && <span style={{ padding: '2px 8px', borderRadius: 980, background: 'linear-gradient(135deg, #AF52DE, #5856D6)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>置顶</span>}
                  {p.category_name && <span style={{ padding: '2px 8px', borderRadius: 980, background: '#F2F2F7', color: '#86868B', fontSize: 10, fontWeight: 500 }}>{p.category_name}</span>}
                </div>
                <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, marginBottom: isMobile ? 2 : 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, color: p.stock === 0 ? '#86868B' : '#1d1d1f' }}>{p.name}</div>
                {p.description && <div style={{ fontSize: isMobile ? 11 : 12, color: '#86868B', marginBottom: isMobile ? 3 : 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 1, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>{p.description}</div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: isMobile ? 17 : 22, fontWeight: 700, color: '#FF3B30' }}><span style={{ fontSize: isMobile ? 10 : 13, fontWeight: 600 }}>¥</span>{Number(p.price).toFixed(2)}</span>
                  {p.original_price && Number(p.original_price) > Number(p.price) && <span style={{ fontSize: isMobile ? 10 : 12, color: '#86868B', textDecoration: 'line-through' }}>¥{Number(p.original_price).toFixed(2)}</span>}
                </div>
                {!isMobile && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11, color: '#86868B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>已售 {p.sales || 0}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#E5E5EA' }}/>
                  <span style={{ color: p.stock > 0 ? '#34C759' : '#FF3B30', fontWeight: 500 }}>{p.stock > 0 ? `库存 ${p.stock}` : '已售罄'}</span>
                </div>}
                {isMobile && <div style={{ fontSize: 10, color: '#86868B', marginTop: 2 }}>已售{p.sales || 0} · {p.stock > 0 ? `剩${p.stock}件` : '无货'}</div>}
              </div>
              {isMobile ? (
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ padding: '6px 16px', borderRadius: 980, background: p.stock > 0 ? '#007AFF' : '#F2F2F7', color: p.stock > 0 ? '#fff' : '#86868B', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.stock > 0 ? '立即购买' : '缺货'}</span>
                </div>
              ) : (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
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

      {/* 页脚 - AppStore 风格 */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: '#F5F5F7' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '32px 20px 28px' : '48px 22px 36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr', gap: isMobile ? 28 : 40, marginBottom: isMobile ? 28 : 36 }}>
            {/* 品牌区 */}
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <img src="/logo.png" alt="logo" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover', display: 'block' }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1f' }}>{site.site_name || '甜甜发卡'}</span>
              </div>
              <p style={{ fontSize: 12, color: '#86868B', lineHeight: 1.7, maxWidth: isMobile ? 280 : 300, margin: isMobile ? '0 auto' : 0 }}>{site.footer_desc || '专业的虚拟商品自动发卡平台，支付宝安全支付，付款后自动秒发卡密，24小时无人值守。'}</p>
            </div>
            {/* 快速链接 - 手机端横向排列，电脑端纵向 */}
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: isMobile ? 14 : 16, color: '#1d1d1f', letterSpacing: 0.3 }}>快速链接</div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 6 : 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/" style={{ padding: isMobile ? '6px 14px' : 0, background: isMobile ? '#fff' : 'transparent', borderRadius: isMobile ? 980 : 0, fontSize: 12, color: isMobile ? '#1d1d1f' : '#86868B', textDecoration: 'none', fontWeight: isMobile ? 500 : 400, transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#007AFF'; if (isMobile) e.currentTarget.style.background = 'rgba(0,122,255,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = isMobile ? '#1d1d1f' : '#86868B'; if (isMobile) e.currentTarget.style.background = '#fff'; }}>首页</a>
                <a href="/query" style={{ padding: isMobile ? '6px 14px' : 0, background: isMobile ? '#fff' : 'transparent', borderRadius: isMobile ? 980 : 0, fontSize: 12, color: isMobile ? '#1d1d1f' : '#86868B', textDecoration: 'none', fontWeight: isMobile ? 500 : 400, transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#007AFF'; if (isMobile) e.currentTarget.style.background = 'rgba(0,122,255,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = isMobile ? '#1d1d1f' : '#86868B'; if (isMobile) e.currentTarget.style.background = '#fff'; }}>订单查询</a>
                <a href="/faq" style={{ padding: isMobile ? '6px 14px' : 0, background: isMobile ? '#fff' : 'transparent', borderRadius: isMobile ? 980 : 0, fontSize: 12, color: isMobile ? '#1d1d1f' : '#86868B', textDecoration: 'none', fontWeight: isMobile ? 500 : 400, transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#007AFF'; if (isMobile) e.currentTarget.style.background = 'rgba(0,122,255,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = isMobile ? '#1d1d1f' : '#86868B'; if (isMobile) e.currentTarget.style.background = '#fff'; }}>常见问题</a>
                <a href="/after-sale" style={{ padding: isMobile ? '6px 14px' : 0, background: isMobile ? '#fff' : 'transparent', borderRadius: isMobile ? 980 : 0, fontSize: 12, color: isMobile ? '#1d1d1f' : '#86868B', textDecoration: 'none', fontWeight: isMobile ? 500 : 400, transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#007AFF'; if (isMobile) e.currentTarget.style.background = 'rgba(0,122,255,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = isMobile ? '#1d1d1f' : '#86868B'; if (isMobile) e.currentTarget.style.background = '#fff'; }}>售后反馈</a>
              </div>
            </div>
            {/* 服务保障 - 仅电脑端 */}
            {!isMobile && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 16, color: '#1d1d1f', letterSpacing: 0.3 }}>服务保障</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#86868B' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    支付宝安全支付
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#86868B' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    24小时自动发货
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#86868B' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    卡密加密存储
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 底部版权 */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#86868B', marginBottom: 4 }}>© {new Date().getFullYear()} {site.site_name || '甜甜发卡'}</div>
            <div style={{ fontSize: 11, color: '#AEAEB2' }}>{site.icp_number || ''} 虚拟商品自动发卡平台</div>
          </div>
        </div>
      </footer>

      {/* 购买弹窗 */}
      {showBuy && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, maxHeight: '88vh', overflowY: 'auto', animation: 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{orderResult ? '订单详情' : '确认购买'}</div>
              <button onClick={closeModal} style={{ cursor: 'pointer', color: '#86868B', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#F2F2F7', border: 'none', padding: 0, transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E5EA'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#F2F2F7'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
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
