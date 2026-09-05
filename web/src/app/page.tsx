'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';

interface Product {
  id: number; name: string; description: string; price: string; original_price: string | null;
  category_id: number; category_name: string; image: string; stock: number; sales: number;
  is_hot: number; is_top: number; has_spec: number; status: number;
}
interface SiteInfo {
  site_name: string; site_logo: string; customer_service: string; qq_group: string; copyright: string;
  banner_title?: string; banner_subtitle?: string; footer_desc?: string; icp_number?: string;
}
interface OrderInfo {
  order_no: string; product_name: string; spec_name: string; quantity: number; total_amount: string;
  status: number; paid_at: string | null; created_at: string; cards: { content: string }[]; contact: string; query_pwd?: string;
}

export default function Home() {
  const router = useRouter();
  const [isWechat, setIsWechat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [site, setSite] = useState<SiteInfo>({ site_name: '甜甜发卡', site_logo: '', customer_service: '', qq_group: '', copyright: '' });
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [contact, setContact] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    loadData();
    return () => { window.removeEventListener('resize', checkMobile); if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const loadData = async () => {
    try {
      const cached = localStorage.getItem('faka_cache');
      if (cached) { try { const d = JSON.parse(cached); if (d.products) setProducts(d.products); if (d.site) setSite(d.site); if (d.categories) setCategories(d.categories); setLoading(false); } catch {} }
    } catch {}
    try {
      const [prodRes, siteRes] = await Promise.all([
        fetch(`${API_BASE}/products.php`, { cache: 'no-store' }),
        fetch(`${API_BASE}/site.php`, { cache: 'no-store' }),
      ]);
      const prodData = await prodRes.json();
      const siteData = await siteRes.json();
      const prods: Product[] = prodData.data?.list || prodData.data || [];
      const st: SiteInfo = siteData.data || {};
      const cats = [...new Set(prods.map((p) => p.category_name).filter(Boolean))];
      setProducts(prods); setSite(st); setCategories(cats); setLoading(false);
      try { localStorage.setItem('faka_cache', JSON.stringify({ products: prods, site: st, categories: cats, timestamp: Date.now() })); } catch {}
    } catch { setLoading(false); }
  };

  const filteredProducts = products.filter((p) => activeCategory === 'all' || p.category_name === activeCategory);

  const openBuy = (product: Product) => {
    setSelectedProduct(product); setQuantity(1); setOrder(null); setQrCode(''); setErrMsg(''); setShowBuy(true);
  };

  const handleBuy = async () => {
    if (!contact.trim()) { setErrMsg('请输入联系方式'); return; }
    if (!selectedProduct) return;
    setOrdering(true); setErrMsg('');
    try {
      const res = await fetch(`${API_BASE}/order_create.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: selectedProduct.id, quantity, contact: contact.trim() }) });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        const ord: OrderInfo = { order_no: data.data.order_no, product_name: selectedProduct.name, spec_name: '', quantity, total_amount: data.data.total_amount, status: 0, paid_at: null, created_at: new Date().toISOString(), cards: [], contact: contact.trim(), query_pwd: data.data.query_pwd };
        setOrder(ord);
        if (data.data.qr_code) { setQrCode(data.data.qr_code); startPolling(data.data.order_no, data.data.query_pwd); }
      } else { setErrMsg(data.msg || '下单失败'); }
    } catch { setErrMsg('下单失败，请重试'); }
    finally { setOrdering(false); }
  };

  const startPolling = (orderNo: string, pwd: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= 120) { if (pollRef.current) clearInterval(pollRef.current); return; }
      try {
        const res = await fetch(`${API_BASE}/order_query.php?order_no=${orderNo}&pwd=${pwd}`);
        const data = await res.json();
        if (data.code === 0 && data.data) {
          const ord = data.data as OrderInfo;
          if (ord.status === 1) { if (pollRef.current) clearInterval(pollRef.current); setOrder(ord); setQrCode(''); }
          else if (ord.status === 2) { if (pollRef.current) clearInterval(pollRef.current); setErrMsg('订单已取消'); }
        }
      } catch {}
    }, 2500);
  };

  const closeModal = () => { setShowBuy(false); setOrder(null); setQrCode(''); setErrMsg(''); if (pollRef.current) clearInterval(pollRef.current); };

  // Apple 风格颜色
  const appleBlue = '#007AFF';
  const appleGray = '#F2F2F7';
  const appleText = '#1D1D1F';
  const appleSubtext = '#86868B';

  return (
    <div style={{ minHeight: '100vh', background: '#FBFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: appleText }}>
      {isWechat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: 60, height: 60, marginBottom: 20, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#07C160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
          </div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>请在浏览器中打开</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>点击右上角「···」<br/>选择「在浏览器打开」即可正常访问</div>
          <div style={{ marginTop: 24, width: 40, height: 40, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      )}
      {/* Apple 毛玻璃导航栏 */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" alt="logo" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1, display: 'inline-block' }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={() => router.push('/query')} style={{ padding: '7px 18px', borderRadius: 20, background: appleBlue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: -0.1, transition: 'all .2s', boxShadow: '0 2px 8px rgba(0,122,255,0.25)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,122,255,0.35)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,122,255,0.25)'; }}>订单查询</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 22px 48px' }}>
        {/* Hero - Apple 大标题风格 */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, letterSpacing: isMobile ? -0.6 : -1.2, margin: '0 0 8px', background: 'linear-gradient(135deg,#1D1D1F 0%,#5856D6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>{site.banner_title || '虚拟商品，即拍即发。'}</h1>
          <p style={{ fontSize: isMobile ? 14 : 17, color: appleSubtext, margin: '0 0 20px', letterSpacing: -0.2 }}>{site.banner_subtitle || '支付宝安全支付，付款后自动秒发卡密。'}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['自动秒发', '加密存储', '安全支付'].map((tag, i) => (
              <span key={i} style={{ padding: '5px 14px', borderRadius: 20, background: appleGray, fontSize: 12, color: appleSubtext, fontWeight: 400 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* 分类 - Apple Segmented Control 风格 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', background: appleGray, borderRadius: 10, padding: 3, gap: 2 }}>
            <span onClick={() => setActiveCategory('all')} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', background: activeCategory === 'all' ? '#fff' : 'transparent', color: activeCategory === 'all' ? appleText : appleSubtext, boxShadow: activeCategory === 'all' ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none', letterSpacing: -0.1 }}>全部</span>
            {categories.map((cat, i) => (
              <span key={i} onClick={() => setActiveCategory(cat)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', background: activeCategory === cat ? '#fff' : 'transparent', color: activeCategory === cat ? appleText : appleSubtext, boxShadow: activeCategory === cat ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' : 'none', letterSpacing: -0.1 }}>{cat}</span>
            ))}
          </div>
        </div>

        {/* 商品网格 - Apple 卡片风格 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: appleSubtext, fontSize: 14 }}>加载中...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: appleSubtext, fontSize: 14 }}>暂无商品</div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? 10 : 20 }}>
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => openBuy(p)} style={{ background: '#ffffff', borderRadius: isMobile ? 12 : 16, overflow: 'hidden', cursor: 'pointer', transition: 'all .3s cubic-bezier(0.25,0.1,0.25,1)', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}
                onMouseEnter={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; } }}
                onMouseLeave={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'; } }}>
                {/* 右下角装饰图标（仅桌面端） */}
                {!isMobile && <div style={{ position: 'absolute', right: -10, bottom: -10, fontSize: 80, opacity: 0.05, pointerEvents: 'none', lineHeight: 1 }}>🎁</div>}
                {/* 内容区 - 移动端横向，桌面端纵向 */}
                <div style={{ padding: isMobile ? '12px 14px' : '18px 20px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 12 : 0, alignItems: isMobile ? 'center' : 'stretch' }}>
                  {/* 左侧信息区 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 标签行 */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: isMobile ? 6 : 12 }}>
                      <span style={{ padding: isMobile ? '2px 7px' : '4px 10px', background: 'rgba(52,199,89,0.1)', borderRadius: 6, fontSize: isMobile ? 10 : 11, fontWeight: 600, color: '#248A3D' }}>秒发</span>
                      {p.is_hot && <span style={{ padding: isMobile ? '2px 7px' : '4px 10px', background: 'rgba(255,59,48,0.1)', borderRadius: 6, fontSize: isMobile ? 10 : 11, fontWeight: 600, color: '#D70015' }}>热门</span>}
                      {p.stock === 0 && <span style={{ padding: isMobile ? '2px 7px' : '4px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: 6, fontSize: isMobile ? 10 : 11, fontWeight: 600, color: appleSubtext }}>已售罄</span>}
                    </div>
                    {/* 商品名 */}
                    <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: isMobile ? 4 : 14, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, letterSpacing: -0.2, color: p.stock === 0 ? appleSubtext : appleText }}>{p.name}</div>
                    {/* 价格 + 销量 */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#FF3B30', letterSpacing: -0.5 }}><span style={{ fontSize: isMobile ? 11 : 14, fontWeight: 600 }}>¥</span>{Number(p.price).toFixed(2)}</span>
                      {!isMobile && p.original_price && Number(p.original_price) > Number(p.price) && <span style={{ fontSize: 12, color: appleSubtext, textDecoration: 'line-through' }}>¥{Number(p.original_price).toFixed(2)}</span>}
                      {isMobile && <span style={{ fontSize: 11, color: appleSubtext }}>已售{p.sales || 0}</span>}
                    </div>
                    {!isMobile && <div style={{ fontSize: 11, color: p.stock > 0 ? '#34C759' : '#FF3B30', marginTop: 6, fontWeight: 500 }}>{p.stock > 0 ? `库存 ${p.stock} 件` : '暂时缺货'}</div>}
                  </div>
                  {/* 右侧按钮区（移动端） / 底部按钮区（桌面端） */}
                  {isMobile ? (
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ padding: '8px 16px', borderRadius: 10, background: p.stock > 0 ? '#007AFF' : appleGray, color: p.stock > 0 ? '#fff' : appleSubtext, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.stock > 0 ? '购买' : '缺货'}</span>
                      <span style={{ fontSize: 10, color: p.stock > 0 ? '#34C759' : '#FF3B30' }}>{p.stock > 0 ? `剩${p.stock}` : '无货'}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <span style={{ fontSize: 11, color: appleSubtext }}>已售 {p.sales || 0} 件</span>
                      <span style={{ padding: '9px 22px', borderRadius: 12, background: p.stock > 0 ? '#007AFF' : appleGray, color: p.stock > 0 ? '#fff' : appleSubtext, fontSize: 13, fontWeight: 600, boxShadow: p.stock > 0 ? '0 4px 12px rgba(0,122,255,0.2)' : 'none' }}>{p.stock > 0 ? '立即购买' : '缺货'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apple 风格页脚 */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#F5F5F7' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '36px 22px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr', gap: isMobile ? 20 : 32, marginBottom: isMobile ? 20 : 28 }}>
            {/* 品牌 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', display: 'block' }} />
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>{site.site_name || '甜甜发卡'}</span>
              </div>
              <p style={{ fontSize: 12, color: appleSubtext, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>{site.footer_desc || '专业的虚拟商品自动发卡平台，支付宝安全支付，付款后自动秒发卡密，24小时无人值守。'}</p>
            </div>
            {/* 快速链接 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: appleText, marginBottom: 12, letterSpacing: -0.1 }}>快速链接</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/" style={{ fontSize: 12, color: appleSubtext, textDecoration: 'none', transition: '.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = appleBlue)} onMouseLeave={(e) => (e.currentTarget.style.color = appleSubtext)}>首页</a>
                <a href="/query" style={{ fontSize: 12, color: appleSubtext, textDecoration: 'none', transition: '.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = appleBlue)} onMouseLeave={(e) => (e.currentTarget.style.color = appleSubtext)}>订单查询</a>
                <a href="/faq" style={{ fontSize: 12, color: appleSubtext, textDecoration: 'none', transition: '.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = appleBlue)} onMouseLeave={(e) => (e.currentTarget.style.color = appleSubtext)}>常见问题</a>
                <a href="/after-sale" style={{ fontSize: 12, color: appleSubtext, textDecoration: 'none', transition: '.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = appleBlue)} onMouseLeave={(e) => (e.currentTarget.style.color = appleSubtext)}>售后反馈</a>
              </div>
            </div>
            {/* 联系我们 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: appleText, marginBottom: 12, letterSpacing: -0.1 }}>联系我们</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {site.customer_service ? <div style={{ fontSize: 12, color: appleSubtext }}>客服：{site.customer_service}</div> : null}
                {site.qq_group ? <div style={{ fontSize: 12, color: appleSubtext }}>QQ群：{site.qq_group}</div> : null}
                <div style={{ fontSize: 12, color: appleSubtext }}>支付方式：支付宝</div>
                <div style={{ fontSize: 12, color: appleSubtext }}>工作时间：24小时自动发货</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16, display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: appleSubtext }}>© {new Date().getFullYear()} {site.site_name || '甜甜发卡'}</div>
            <div style={{ fontSize: 11, color: appleSubtext }}>{site.icp_number || ''} 虚拟商品自动发卡平台</div>
          </div>
        </div>
      </footer>

      {/* 购买弹窗 - Apple 风格 */}
      {showBuy && selectedProduct && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
              <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>{order?.status === 1 ? '支付成功' : '确认订单'}</span>
              <span onClick={closeModal} style={{ cursor: 'pointer', color: appleSubtext, fontSize: 18, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: appleGray }}>✕</span>
            </div>
            <div style={{ padding: 20 }}>
              {qrCode && order?.status === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>请使用支付宝扫码支付</div>
                  <div style={{ fontSize: 12, color: appleSubtext, marginBottom: 16 }}>订单号：<span style={{ fontFamily: 'monospace', color: appleText }}>{order.order_no}</span></div>
                  <div style={{ width: 180, height: 180, margin: '0 auto 16px', padding: 12, background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrCode)}`} alt="支付二维码" style={{ width: 160, height: 160 }} />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#F2F2F7', borderRadius: 16, fontSize: 13, color: appleBlue, marginBottom: 12 }}>
                    <span style={{ width: 12, height: 12, border: '2px solid #007AFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }}></span>等待支付中...
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#FF3B30', marginBottom: 12, letterSpacing: -0.5 }}>¥{order.total_amount}</div>
                  <a href={qrCode} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: 'linear-gradient(135deg,#1677FF,#0958D9)', color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(22,119,255,0.3)' }}>
                    <svg width="18" height="18" viewBox="0 0 1024 1024" fill="none"><path d="M157.54752 643.09248c-7.1424 35.5328 14.14656 120.54528 148.82816 120.54528 82.93888 0 162.7904-50.41152 227.76832-135.00928-92.52864-45.07136-169.61536-67.09248-255.6416-67.09248-74.87488 0-113.90464 46.16704-120.95488 81.55648z" fill="#fff"/><path d="M972.75392 682.13248H972.8V174.08c0-67.8656-55.0144-122.88-122.88-122.88H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88v-21.85728l-253.4656-111.28832c-39.2704-17.65888-76.47232-34.70336-106.07616-48.8448-80.73216 97.82784-165.32992 156.53888-292.78208 156.53888s-212.5568-78.52544-202.32704-174.6432c6.72768-63.03744 49.9968-166.1184 237.85472-148.46976 99.06688 9.30816 144.3584 27.79136 225.13664 54.46656 20.87424-38.33856 38.2464-80.50176 51.42528-125.3376H274.44736v-35.4816h177.21344V331.22816H235.50976V292.1984h216.10496V200.2688s1.93536-14.37696 17.83296-14.37696h88.60672V292.1984h230.38976v39.07584h-230.38976V394.9568h187.95008a725.6576 725.6576 0 0 1-76.34432 191.41632c54.59968 19.8144 303.09376 95.75936 303.09376 95.75936z" fill="#fff"/></svg>
                    打开支付宝支付
                  </a>
                </div>
              ) : order?.status === 1 ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: 'linear-gradient(135deg,#34C759,#30D158)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(52,199,89,0.3)' }}><span style={{ fontSize: 28, color: '#fff' }}>✓</span></div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', letterSpacing: -0.5 }}>支付成功</h3>
                  <p style={{ fontSize: 12, color: appleSubtext, marginBottom: 16 }}>订单号：<span style={{ fontFamily: 'monospace', color: appleText }}>{order.order_no}</span></p>
                  <div style={{ background: appleGray, borderRadius: 12, padding: 14, marginBottom: 16, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}><span style={{ color: appleSubtext }}>商品</span><span style={{ fontWeight: 500 }}>{order.product_name}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}><span style={{ color: appleSubtext }}>金额</span><span style={{ fontWeight: 600, color: appleBlue }}>¥{order.total_amount}</span></div>
                  </div>
                  {order.cards && order.cards.length > 0 && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>您的卡密 ({order.cards.length}条)</div>
                      {order.cards.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: appleGray, borderRadius: 10, marginBottom: 8 }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: appleBlue, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{c.content}</span>
                          <button onClick={() => { navigator.clipboard?.writeText(c.content).then(() => { setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 1500); }).catch(() => {}); }} style={{ padding: '5px 12px', background: copiedIdx === i ? '#34C759' : appleBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0, transition: 'all .2s', minWidth: 44 }}>{copiedIdx === i ? '已复制' : '复制'}</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 14, padding: 14, background: appleGray, borderRadius: 14, marginBottom: 18 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 12, background: selectedProduct.image ? '#fff' : 'linear-gradient(135deg,#E8E8ED,#D1D1D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {selectedProduct.image ? <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>🎁</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#FF3B30', letterSpacing: -0.5 }}><span style={{ fontSize: 12 }}>¥</span>{selectedProduct.price}</div>
                      <div style={{ fontSize: 11, color: selectedProduct.stock > 0 ? '#34C759' : '#FF3B30', marginTop: 2 }}>{selectedProduct.stock > 0 ? `库存 ${selectedProduct.stock} 件` : '已售罄'}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>联系方式</label>
                    <input type="text" placeholder="手机号 / 邮箱 / QQ号" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E5EA', background: '#fff', borderRadius: 8, fontSize: 12, outline: 'none', letterSpacing: -0.1 }} onFocus={(e) => { e.currentTarget.style.borderColor = appleBlue; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>购买数量</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5EA', borderRadius: 10, overflow: 'hidden' }}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 32, height: 32, border: 'none', background: '#FAFAFA', cursor: 'pointer', fontSize: 15, fontWeight: 500, color: appleText }}>-</button>
                        <span style={{ width: 32, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} style={{ width: 32, height: 32, border: 'none', background: '#FAFAFA', cursor: 'pointer', fontSize: 15, fontWeight: 500, color: appleText }}>+</button>
                      </div>
                      <span style={{ fontSize: 11, color: appleSubtext }}>最多 {selectedProduct.stock} 件</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>支付方式</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px solid #1677FF', borderRadius: 12, background: 'rgba(22,119,255,0.04)', cursor: 'pointer' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="34" height="34" viewBox="0 0 1024 1024" fill="none"><path d="M157.54752 643.09248c-7.1424 35.5328 14.14656 120.54528 148.82816 120.54528 82.93888 0 162.7904-50.41152 227.76832-135.00928-92.52864-45.07136-169.61536-67.09248-255.6416-67.09248-74.87488 0-113.90464 46.16704-120.95488 81.55648z" fill="#1678FF"/><path d="M972.75392 682.13248H972.8V174.08c0-67.8656-55.0144-122.88-122.88-122.88H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88v-21.85728l-253.4656-111.28832c-39.2704-17.65888-76.47232-34.70336-106.07616-48.8448-80.73216 97.82784-165.32992 156.53888-292.78208 156.53888s-212.5568-78.52544-202.32704-174.6432c6.72768-63.03744 49.9968-166.1184 237.85472-148.46976 99.06688 9.30816 144.3584 27.79136 225.13664 54.46656 20.87424-38.33856 38.2464-80.50176 51.42528-125.3376H274.44736v-35.4816h177.21344V331.22816H235.50976V292.1984h216.10496V200.2688s1.93536-14.37696 17.83296-14.37696h88.60672V292.1984h230.38976v39.07584h-230.38976V394.9568h187.95008a725.6576 725.6576 0 0 1-76.34432 191.41632c54.59968 19.8144 303.09376 95.75936 303.09376 95.75936z" fill="#1678FF"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: appleText }}>支付宝</div>
                        <div style={{ fontSize: 11, color: appleSubtext }}>推荐使用支付宝扫码支付</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #1677FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677FF' }}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid #F2F2F7', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, color: appleSubtext }}>合计 <span style={{ fontSize: 11 }}>({quantity}件)</span></span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#FF3B30', letterSpacing: -0.5 }}>¥{(Number(selectedProduct.price) * quantity).toFixed(2)}</span>
                  </div>
                  {errMsg && <div style={{ color: '#FF3B30', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{errMsg}</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: appleGray, color: appleText, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>取消</button>
                    <button onClick={handleBuy} disabled={ordering || selectedProduct.stock <= 0} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 14, fontWeight: 600, cursor: ordering ? 'not-allowed' : 'pointer', opacity: ordering ? 0.6 : 1, boxShadow: '0 4px 12px rgba(0,122,255,0.3)', transition: '.2s' }}>{ordering ? '处理中...' : '立即支付'}</button>
                  </div>
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, fontSize: 11, color: '#34C759', display: 'flex', alignItems: 'center', gap: 6 }}>🔒 支付成功后自动发货，卡密可在订单查询中查看</div>
                </>
              )}
            </div>
            {order?.status === 1 && (
              <div style={{ padding: '12px 20px 18px', borderTop: '1px solid #F2F2F7', display: 'flex', gap: 10 }}>
                <button onClick={closeModal} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: appleGray, color: appleText, fontSize: 13, cursor: 'pointer' }}>关闭</button>
                <button onClick={() => { closeModal(); router.push('/query'); }} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: appleBlue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>订单查询</button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:640px){.product-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </div>
  );
}
