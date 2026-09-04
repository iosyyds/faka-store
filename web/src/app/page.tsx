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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { loadData(); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

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
      {/* Apple 毛玻璃导航栏 */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#007AFF,#5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: -0.5 }}>{site.site_name?.[0] || '甜'}</div>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={() => router.push('/query')} style={{ padding: '7px 18px', borderRadius: 20, background: appleBlue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: -0.1, transition: 'all .2s', boxShadow: '0 2px 8px rgba(0,122,255,0.25)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,122,255,0.35)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,122,255,0.25)'; }}>订单查询</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 22px 48px' }}>
        {/* Hero - Apple 大标题风格 */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.2, margin: '0 0 8px', background: 'linear-gradient(135deg,#1D1D1F 0%,#5856D6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>{site.banner_title || '虚拟商品，即拍即发。'}</h1>
          <p style={{ fontSize: 17, color: appleSubtext, margin: '0 0 20px', letterSpacing: -0.2 }}>{site.banner_subtitle || '支付宝安全支付，付款后自动秒发卡密。'}</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => openBuy(p)} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .3s cubic-bezier(0.25,0.1,0.25,1)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}>
                {/* 图片区 */}
                <div style={{ height: 150, background: p.image ? '#fafafa' : 'linear-gradient(135deg,#F2F2F7,#E8E8ED)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 48, opacity: 0.6 }}>🎁</span>}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
                    <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: 12, fontSize: 10, fontWeight: 600, color: '#34C759', letterSpacing: 0.2 }}>⚡ 秒发</span>
                    {p.is_hot ? <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: 12, fontSize: 10, fontWeight: 600, color: '#FF3B30' }}>热门</span> : null}
                  </div>
                  {p.stock === 0 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ padding: '6px 18px', background: '#1D1D1F', color: '#fff', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>已售罄</span></div>}
                </div>
                {/* 内容区 */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 38, lineHeight: 1.35, letterSpacing: -0.2 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#FF3B30', letterSpacing: -0.5 }}><span style={{ fontSize: 12, fontWeight: 600 }}>¥</span>{Number(p.price).toFixed(2)}</span>
                    {p.original_price && Number(p.original_price) > Number(p.price) ? <span style={{ fontSize: 11, color: appleSubtext, textDecoration: 'line-through' }}>¥{Number(p.original_price).toFixed(2)}</span> : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: appleSubtext }}>已售 {p.sales || 0}</span>
                    <span style={{ padding: '6px 14px', borderRadius: 14, background: p.stock > 0 ? appleBlue : appleGray, color: p.stock > 0 ? '#fff' : appleSubtext, fontSize: 12, fontWeight: 500, transition: '.2s' }}>{p.stock > 0 ? '立即购买' : '缺货'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apple 风格页脚 */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#F5F5F7' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '28px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: appleText }}>{site.site_name || '甜甜发卡'}</div>
            <div style={{ fontSize: 12, color: appleSubtext, maxWidth: 280, lineHeight: 1.6 }}>{site.footer_desc || '本站仅出售合规虚拟商品，下单即视为同意服务条款。'}</div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/faq" style={{ fontSize: 12, color: appleSubtext, textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.color = appleBlue)} onMouseLeave={(e) => (e.currentTarget.style.color = appleSubtext)}>常见问题</a>
              <a href="/after-sale" style={{ fontSize: 12, color: appleSubtext, textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.color = appleBlue)} onMouseLeave={(e) => (e.currentTarget.style.color = appleSubtext)}>售后反馈</a>
            </div>
            {site.customer_service ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: appleSubtext }}>客服：{site.customer_service}</div>
                {site.qq_group ? <div style={{ fontSize: 12, color: appleSubtext }}>QQ群：{site.qq_group}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '14px 22px', textAlign: 'center', fontSize: 11, color: appleSubtext }}>© {new Date().getFullYear()} {site.site_name || '甜甜发卡'} {site.copyright || ''} {site.icp_number || ''}</div>
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
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#FF3B30', marginBottom: 6, letterSpacing: -0.5 }}>¥{order.total_amount}</div>
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
                          <button onClick={() => navigator.clipboard?.writeText(c.content).catch(() => {})} style={{ padding: '5px 12px', background: appleBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>复制</button>
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
                    <input type="text" placeholder="手机号 / 邮箱 / QQ号" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: 'none', background: appleGray, borderRadius: 12, fontSize: 14, outline: 'none', letterSpacing: -0.1 }} onFocus={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,122,255,0.3)'; }} onBlur={(e) => { e.currentTarget.style.background = appleGray; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: appleSubtext, marginBottom: 6 }}>购买数量</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: appleGray, borderRadius: 10, overflow: 'hidden' }}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, fontWeight: 500, color: appleText }}>-</button>
                        <span style={{ width: 36, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, fontWeight: 500, color: appleText }}>+</button>
                      </div>
                      <span style={{ fontSize: 11, color: appleSubtext }}>最多 {selectedProduct.stock} 件</span>
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
