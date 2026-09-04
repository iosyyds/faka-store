'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';

const API_BASE = 'https://kk.qqqi.top/api';

interface Product {
  id: number; name: string; description: string; price: string; original_price: string | null;
  category_id: number; category_name: string; image: string; stock: number; sales: number;
  is_hot: number; is_top: number; has_spec: number; status: number;
}

interface SiteInfo {
  site_name: string; site_logo: string; customer_service: string; qq_group: string; copyright: string;
  banner_title?: string; banner_subtitle?: string; banner_tag1?: string; banner_tag2?: string; banner_tag3?: string;
  footer_desc?: string; icp_number?: string;
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

  useEffect(() => {
    loadData();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
    if (!contact.trim()) { setErrMsg('请输入联系方式（手机号/邮箱/QQ）'); return; }
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

  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 10, border: '1px solid #eef0f3', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s ease', position: 'relative' };
  const cardHover: React.CSSProperties = { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(37,99,235,0.1)', borderColor: '#bfdbfe' };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* 导航栏 - 去掉搜索 */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #eef0f3', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{site.site_name?.[0] || '甜'}</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={() => router.push('/query')} style={{ padding: '7px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>订单查询</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        {/* Hero 横幅 */}
        <div style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)', borderRadius: 12, padding: '24px 28px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 6px', lineHeight: 1.2 }}>{site.banner_title || '虚拟商品·即拍即发'}</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>{site.banner_subtitle || '支付宝多渠道支付，付款后自动秒发卡密'}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[site.banner_tag1 || '自动秒发', site.banner_tag2 || '加密存储', site.banner_tag3 || '多渠道支付'].map((tag, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: '#fff', borderRadius: 12, fontSize: 12, color: '#2563eb', fontWeight: 500, boxShadow: '0 1px 4px rgba(37,99,235,0.06)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb' }}></span>{tag}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, opacity: 0.12 }}>
            <svg viewBox="0 0 100 100" width="140" height="140"><circle cx="50" cy="50" r="8" fill="#2563eb" /><ellipse cx="50" cy="25" rx="12" ry="18" fill="#7c3aed" /><ellipse cx="50" cy="75" rx="12" ry="18" fill="#7c3aed" /><ellipse cx="25" cy="50" rx="18" ry="12" fill="#7c3aed" /><ellipse cx="75" cy="50" rx="18" ry="12" fill="#7c3aed" /></svg>
          </div>
        </div>

        {/* 分类标签 - 方块样式 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          <span onClick={() => setActiveCategory('all')} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '.15s', background: activeCategory === 'all' ? '#2563eb' : '#fff', color: activeCategory === 'all' ? '#fff' : '#6b7280', border: '1px solid', borderColor: activeCategory === 'all' ? '#2563eb' : '#e5e7eb' }}>全部商品</span>
          {categories.map((cat, i) => (
            <span key={i} onClick={() => setActiveCategory(cat)} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '.15s', background: activeCategory === cat ? '#2563eb' : '#fff', color: activeCategory === cat ? '#fff' : '#6b7280', border: '1px solid', borderColor: activeCategory === cat ? '#2563eb' : '#e5e7eb' }}>{cat}</span>
          ))}
        </div>

        {/* 商品网格 - 新版卡片 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}><Icon name="refresh" size={32} /><div style={{ marginTop: 12 }}>加载中...</div></div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}><Icon name="box" size={48} /><div style={{ marginTop: 12, fontSize: 14 }}>暂无商品</div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {filteredProducts.map((p) => (
              <div key={p.id} style={cardStyle} onClick={() => openBuy(p)} onMouseEnter={(e) => { Object.assign(e.currentTarget.style, cardHover); }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#eef0f3'; }}>
                {/* 图片区 */}
                <div style={{ height: 130, background: p.image ? '#f9fafb' : 'linear-gradient(135deg,#dbeafe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 44 }}>🎁</span>}
                  {/* 左上角标签 */}
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                    <span style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.9)', color: '#fff', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>⚡秒发</span>
                    {p.is_hot ? <span style={{ padding: '3px 8px', background: 'rgba(239,68,68,0.9)', color: '#fff', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>热门</span> : null}
                  </div>
                  {p.stock === 0 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ padding: '4px 14px', background: '#374151', color: '#fff', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>已售罄</span></div>}
                </div>
                {/* 内容区 */}
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 36, lineHeight: 1.4 }}>{p.name}</div>
                  {/* 价格行 */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}><span style={{ fontSize: 11, fontWeight: 600 }}>¥</span>{Number(p.price).toFixed(2)}</span>
                    {p.original_price && Number(p.original_price) > Number(p.price) ? <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>¥{Number(p.original_price).toFixed(2)}</span> : null}
                  </div>
                  {/* 底部：销量 + 按钮 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>已售 {p.sales || 0}</span>
                    <span style={{ padding: '5px 12px', background: p.stock > 0 ? '#2563eb' : '#e5e7eb', color: p.stock > 0 ? '#fff' : '#9ca3af', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{p.stock > 0 ? '立即购买' : '缺货'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer style={{ background: '#fff', borderTop: '1px solid #eef0f3', marginTop: 48, padding: '36px 0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{site.site_name || '甜甜发卡'}</div>
              <div style={{ fontSize: 13, color: '#9ca3af', maxWidth: 300, lineHeight: 1.7 }}>{site.footer_desc || '本站仅出售合规虚拟商品，下单即视为同意服务条款。'}</div>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div><a href="/faq" style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 8 }}>常见问题</a><a href="/after-sale" style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 8 }}>售后反馈</a></div>
              {site.customer_service ? <div><div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>客服：{site.customer_service}</div>{site.qq_group ? <div style={{ fontSize: 13, color: '#6b7280' }}>QQ群：{site.qq_group}</div> : null}</div> : null}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>© {new Date().getFullYear()} {site.site_name || '甜甜发卡'} {site.copyright || ''} {site.icp_number || ''}</div>
        </div>
      </footer>

      {/* 购买弹窗 */}
      {showBuy && selectedProduct && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{order?.status === 1 ? '✓ 支付结果' : '🛒 确认订单'}</span>
              <span onClick={closeModal} style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 20 }}>✕</span>
            </div>
            <div style={{ padding: 20 }}>
              {qrCode && order?.status === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>请使用支付宝扫码支付</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>订单号：<span style={{ fontFamily: 'monospace' }}>{order.order_no}</span></div>
                  <div style={{ width: 200, height: 200, margin: '0 auto 16px', padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}`} alt="支付二维码" style={{ width: 180, height: 180 }} />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 14, color: '#1e40af', marginBottom: 12 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }}></span>等待支付中...
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>¥{order.total_amount}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>查询密码：{order.query_pwd}（请保存）</div>
                </div>
              ) : order?.status === 1 ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, margin: '0 auto 12px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 28, color: '#16a34a' }}>✓</span></div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>支付成功</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>订单号：<span style={{ fontFamily: 'monospace', color: '#111827' }}>{order.order_no}</span></p>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}><span style={{ color: '#6b7280' }}>商品</span><span style={{ fontWeight: 500 }}>{order.product_name}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}><span style={{ color: '#6b7280' }}>金额</span><span style={{ fontWeight: 600, color: '#2563eb' }}>¥{order.total_amount}</span></div>
                  </div>
                  {order.cards && order.cards.length > 0 && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>🎫 您的卡密 ({order.cards.length}条)</div>
                      {order.cards.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8 }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}>{c.content}</span>
                          <button onClick={() => navigator.clipboard?.writeText(c.content).catch(() => {})} style={{ padding: '4px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>复制</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 14, padding: 14, background: '#f9fafb', borderRadius: 12, marginBottom: 18 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 10, background: selectedProduct.image ? '#fff' : 'linear-gradient(135deg,#dbeafe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {selectedProduct.image ? <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🎁</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}><span style={{ fontSize: 13 }}>¥</span>{selectedProduct.price}</div>
                      <div style={{ fontSize: 12, color: selectedProduct.stock > 0 ? '#16a34a' : '#ef4444', marginTop: 4 }}>{selectedProduct.stock > 0 ? `库存充足 (${selectedProduct.stock}件)` : '已售罄'}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>联系方式 <span style={{ color: '#9ca3af', fontWeight: 400 }}>用于查询订单和卡密</span></label>
                    <input type="text" placeholder="手机号 / 邮箱 / QQ号" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none' }} onFocus={(e) => (e.currentTarget.style.borderColor = '#2563eb')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>购买数量</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 38, height: 38, border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>-</button>
                        <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} style={{ width: 38, height: 38, border: 'none', background: '#f9fafb', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>+</button>
                      </div>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>最多可买 {selectedProduct.stock} 件</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid #f1f5f9', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>合计 <span style={{ fontSize: 12 }}>({quantity}件)</span></span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>¥{(Number(selectedProduct.price) * quantity).toFixed(2)}</span>
                  </div>
                  {errMsg && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{errMsg}</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>取消</button>
                    <button onClick={handleBuy} disabled={ordering || selectedProduct.stock <= 0} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: ordering ? 'not-allowed' : 'pointer', opacity: ordering ? 0.7 : 1 }}>{ordering ? '处理中...' : '立即支付'}</button>
                  </div>
                  <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>🔒 支付成功后自动发货，卡密可在订单查询中查看</div>
                </>
              )}
            </div>
            {order?.status === 1 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
                <button onClick={closeModal} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer' }}>关闭</button>
                <button onClick={() => { closeModal(); router.push('/query'); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>订单查询</button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
