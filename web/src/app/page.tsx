'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://kk.qqqi.top/api';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/site.php`).then(r => r.json()).then(d => setSite(d.data || d)).catch(() => {});
    fetch(`${API_BASE}/products.php`).then(r => r.json()).then(d => {
      const list = d.data || d.products || d.list || [];
      setProducts(list);
      const cats = Array.from(new Set(list.map((p: any) => p.category_name || p.category).filter(Boolean)));
      setCategories(cats as string[]);
    }).catch(() => {});
  }, []);

  const filteredProducts = activeCategory === 'all' ? products : products.filter(p => (p.category_name || p.category) === activeCategory);

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

  const handleBuy = async () => {
    if (!contact.trim()) { alert('请填写联系方式'); return; }
    setOrdering(true);
    try {
      const res = await fetch(`${API_BASE}/order_create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: selectedProduct.id, quantity, contact, pay_method: 'alipay' })
      });
      const data = await res.json();
      if (data.code === 0 || data.code === 200 || data.success) {
        const order = data.data || data.order || data;
        setOrderResult(order);
        if (order.qr_code || order.qrcode || order.code_url) {
          setQrCode(order.qr_code || order.qrcode || order.code_url);
        }
        setPolling(true);
        pollOrder(order.order_no || order.order_id || order.id);
      } else {
        alert(data.msg || data.message || '下单失败');
      }
    } catch (e) {
      alert('网络错误，请重试');
    }
    setOrdering(false);
  };

  const pollOrder = (orderId: string) => {
    let count = 0;
    const timer = setInterval(async () => {
      count++;
      if (count > 60) { clearInterval(timer); setPolling(false); return; }
      try {
        const res = await fetch(`${API_BASE}/order_query.php?order_no=${orderId}&contact=${encodeURIComponent(contact)}`);
        const data = await res.json();
        const order = data.data || data.order || data;
        if (order.status === 'paid' || order.status === 1 || order.status === 'success') {
          clearInterval(timer);
          setPolling(false);
          setOrderResult({ ...orderResult, ...order, cards: order.cards || [] });
        }
      } catch (e) {}
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1d1d1f' }}>
      {/* 微信提示 */}
      {isWechat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"></path><path d="M7 7h10v10"></path></svg>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>右上角</span>
          </div>
          <div style={{ width: 72, height: 72, marginBottom: 24, borderRadius: 20, background: 'linear-gradient(135deg,#07C160,#06AD56)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(7,193,96,0.4)' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 }}>请在浏览器中打开</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center', lineHeight: 1.7, maxWidth: 300 }}>
            微信内无法正常使用支付功能<br/>点击右上角「···」<br/>选择「在浏览器打开」即可正常访问
          </div>
          <div style={{ position: 'absolute', bottom: 48, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            安全支付环境检测
          </div>
        </div>
      )}

      {/* 导航栏 */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '0 16px' : '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.3 }}>{site.site_name || '甜甜发卡'}</span>
          </div>
          <button onClick={() => router.push('/query')} style={{ padding: '7px 16px', borderRadius: 980, background: '#007AFF', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>订单查询</button>
        </div>
      </nav>

      {/* 主内容 */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '24px 16px 40px' : '48px 22px 64px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 48 }}>
          <h1 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 700, letterSpacing: isMobile ? -0.5 : -1.5, marginBottom: 10, lineHeight: 1.1 }}>{site.banner_title || '虚拟商品，即拍即发。'}</h1>
          <p style={{ fontSize: isMobile ? 14 : 17, color: '#86868B', marginBottom: 20, letterSpacing: -0.2 }}>{site.banner_subtitle || '支付宝安全支付，付款后自动秒发卡密。'}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['自动秒发', '加密存储', '安全支付'].map((t, i) => (
              <span key={i} style={{ padding: '5px 14px', background: '#F5F5F7', borderRadius: 980, fontSize: 12, color: '#1d1d1f', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* 分类 */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: isMobile ? 20 : 28, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            <span onClick={() => setActiveCategory('all')} style={{ padding: '7px 16px', borderRadius: 980, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: activeCategory === 'all' ? '#1d1d1f' : '#F5F5F7', color: activeCategory === 'all' ? '#fff' : '#1d1d1f', transition: 'all .2s' }}>全部</span>
            {categories.map((cat, i) => (
              <span key={i} onClick={() => setActiveCategory(cat)} style={{ padding: '7px 16px', borderRadius: 980, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: activeCategory === cat ? '#1d1d1f' : '#F5F5F7', color: activeCategory === cat ? '#fff' : '#1d1d1f', transition: 'all .2s' }}>{cat}</span>
            ))}
          </div>
        )}

        {/* 商品列表 - 电脑端卡片，手机端列表 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? 0 : 16 }}>
          {filteredProducts.map((p, idx) => (
            <div key={p.id} onClick={() => openBuy(p)} style={{
              background: '#fff',
              borderRadius: isMobile ? 0 : 18,
              cursor: 'pointer',
              transition: 'all .2s ease',
              borderBottom: isMobile ? '1px solid #F2F2F7' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: isMobile ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
              padding: isMobile ? '14px 0' : '20px',
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              gap: isMobile ? 14 : 0,
              alignItems: isMobile ? 'center' : 'stretch'
            }}
              onMouseEnter={(e) => { if (!isMobile) { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { if (!isMobile) { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {/* 左侧信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* 标签 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: isMobile ? 5 : 10 }}>
                  <span style={{ padding: '2px 7px', background: '#F5F5F7', borderRadius: 5, fontSize: 10, fontWeight: 600, color: '#34C759' }}>秒发</span>
                  {p.is_hot && <span style={{ padding: '2px 7px', background: '#F5F5F7', borderRadius: 5, fontSize: 10, fontWeight: 600, color: '#FF3B30' }}>热门</span>}
                </div>
                {/* 商品名 */}
                <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, marginBottom: isMobile ? 4 : 10, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, color: p.stock === 0 ? '#86868B' : '#1d1d1f' }}>{p.name}</div>
                {/* 价格 */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#FF3B30' }}><span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>¥</span>{Number(p.price).toFixed(2)}</span>
                  {isMobile && <span style={{ fontSize: 11, color: '#86868B' }}>已售{p.sales || 0}</span>}
                </div>
                {!isMobile && <div style={{ fontSize: 12, color: '#86868B', marginTop: 8 }}>已售 {p.sales || 0} 件 · {p.stock > 0 ? `库存 ${p.stock}` : '已售罄'}</div>}
              </div>
              {/* 右侧按钮 */}
              {isMobile ? (
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ padding: '7px 16px', borderRadius: 980, background: p.stock > 0 ? '#007AFF' : '#F2F2F7', color: p.stock > 0 ? '#fff' : '#86868B', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.stock > 0 ? '购买' : '缺货'}</span>
                  <span style={{ fontSize: 10, color: p.stock > 0 ? '#34C759' : '#FF3B30', fontWeight: 500 }}>{p.stock > 0 ? `剩${p.stock}件` : '无货'}</span>
                </div>
              ) : (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ padding: '8px 20px', borderRadius: 980, background: p.stock > 0 ? '#007AFF' : '#F2F2F7', color: p.stock > 0 ? '#fff' : '#86868B', fontSize: 13, fontWeight: 600 }}>{p.stock > 0 ? '立即购买' : '缺货'}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#86868B' }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📦</div>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            {/* 弹窗头部 */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{orderResult ? '订单详情' : '确认购买'}</div>
              {!polling && <span onClick={closeModal} style={{ cursor: 'pointer', color: '#86868B', fontSize: 18, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#F2F2F7' }}>✕</span>}
            </div>

            <div style={{ padding: 20 }}>
              {/* 支付中 - 二维码 */}
              {qrCode && !orderResult?.cards && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 180, height: 180, margin: '0 auto 16px', padding: 12, background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={qrCode} alt="支付二维码" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#F2F2F7', borderRadius: 980, fontSize: 13, color: '#007AFF', marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#007AFF', animation: 'pulse 1.5s infinite' }}></span>
                    等待支付中...
                  </div>
                  <div style={{ fontSize: 13, color: '#86868B', marginBottom: 16 }}>订单号：{orderResult?.order_no || ''}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', marginBottom: 16 }}>¥{Number(selectedProduct.price * quantity).toFixed(2)}</div>
                  <a href={qrCode} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#1677FF', color: '#fff', borderRadius: 980, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="18" height="18" viewBox="0 0 1024 1024" fill="#fff"><path d="M230.4 788.48c-14.336 0-28.672-5.12-38.912-15.36-20.992-20.992-20.992-55.296 0-76.288l307.2-307.2c20.992-20.992 55.296-20.992 76.288 0s20.992 55.296 0 76.288l-307.2 307.2c-10.24 10.24-24.576 15.36-37.376 15.36z"/><path d="M788.48 788.48h-184.32c-30.72 0-55.296-24.576-55.296-55.296s24.576-55.296 55.296-55.296h184.32c30.72 0 55.296 24.576 55.296 55.296s-24.576 55.296-55.296 55.296z"/><path d="M230.4 368.64h-76.288C123.392 368.64 98.816 344.064 98.816 313.344V128.96c0-30.72 24.576-55.296 55.296-55.296h184.32c30.72 0 55.296 24.576 55.296 55.296s-24.576 55.296-55.296 55.296h-128v128c0 30.72-24.576 55.296-55.296 55.296z"/><path d="M788.48 368.64h-184.32c-30.72 0-55.296-24.576-55.296-55.296V128.96c0-30.72 24.576-55.296 55.296-55.296h184.32c30.72 0 55.296 24.576 55.296 55.296v184.32c0 30.72-24.576 55.296-55.296 55.296z"/></svg>
                    打开支付宝支付
                  </a>
                </div>
              )}

              {/* 支付成功 - 卡密 */}
              {orderResult?.cards && orderResult.cards.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 28, color: '#fff' }}>✓</span></div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>支付成功</div>
                  <div style={{ fontSize: 13, color: '#86868B', marginBottom: 16 }}>卡密已自动发送，请妥善保管</div>
                  <div style={{ textAlign: 'left', marginBottom: 16 }}>
                    {orderResult.cards.map((c: any, i: number) => (
                      <div key={i} style={{ padding: '10px 12px', background: '#F5F5F7', borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#007AFF', wordBreak: 'break-all', flex: 1 }}>{typeof c === 'string' ? c : c.content}</span>
                        <button onClick={() => { navigator.clipboard?.writeText(typeof c === 'string' ? c : c.content).then(() => { setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 1500); }).catch(() => {}); }} style={{ padding: '5px 12px', background: copiedIdx === i ? '#34C759' : '#007AFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>{copiedIdx === i ? '已复制' : '复制'}</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#F2F2F7', color: '#1d1d1f', fontSize: 13, cursor: 'pointer' }}>关闭</button>
                    <button onClick={() => { closeModal(); router.push('/query'); }} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#007AFF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>订单查询</button>
                  </div>
                </div>
              )}

              {/* 购买表单 */}
              {!qrCode && !orderResult?.cards && (
                <>
                  {/* 商品信息 */}
                  <div style={{ padding: 12, background: '#F5F5F7', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#E8E8ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🎫</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: 12, color: '#86868B' }}>库存 {selectedProduct.stock} 件</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#FF3B30' }}>¥{Number(selectedProduct.price).toFixed(2)}</div>
                  </div>

                  {/* 联系方式 */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#1d1d1f' }}>联系方式</div>
                    <input type="text" placeholder="手机号 / 邮箱 / QQ号" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5EA', background: '#fff', borderRadius: 10, fontSize: 14, outline: 'none' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#007AFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.1)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5EA'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>

                  {/* 数量 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#1d1d1f' }}>购买数量</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 36, border: 'none', background: '#F5F5F7', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 500 }}>-</button>
                      <span style={{ fontSize: 16, fontWeight: 600, minWidth: 32, textAlign: 'center' }}>{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} style={{ width: 36, height: 36, border: 'none', background: '#F5F5F7', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 500 }}>+</button>
                    </div>
                  </div>

                  {/* 总价 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F5F5F7', borderRadius: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 14, color: '#86868B' }}>合计</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#FF3B30' }}>¥{Number(selectedProduct.price * quantity).toFixed(2)}</span>
                  </div>

                  {/* 支付方式 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#1d1d1f' }}>支付方式</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1.5px solid #007AFF', borderRadius: 12, background: 'rgba(0,122,255,0.04)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1677FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 1024 1024" fill="#fff"><path d="M230.4 788.48c-14.336 0-28.672-5.12-38.912-15.36-20.992-20.992-20.992-55.296 0-76.288l307.2-307.2c20.992-20.992 55.296-20.992 76.288 0s20.992 55.296 0 76.288l-307.2 307.2c-10.24 10.24-24.576 15.36-37.376 15.36z"/><path d="M788.48 788.48h-184.32c-30.72 0-55.296-24.576-55.296-55.296s24.576-55.296 55.296-55.296h184.32c30.72 0 55.296 24.576 55.296 55.296s-24.576 55.296-55.296 55.296z"/><path d="M230.4 368.64h-76.288C123.392 368.64 98.816 344.064 98.816 313.344V128.96c0-30.72 24.576-55.296 55.296-55.296h184.32c30.72 0 55.296 24.576 55.296 55.296s-24.576 55.296-55.296 55.296h-128v128c0 30.72-24.576 55.296-55.296 55.296z"/><path d="M788.48 368.64h-184.32c-30.72 0-55.296-24.576-55.296-55.296V128.96c0-30.72 24.576-55.296 55.296-55.296h184.32c30.72 0 55.296 24.576 55.296 55.296v184.32c0 30.72-24.576 55.296-55.296 55.296z"/></svg>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>支付宝</span>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#007AFF' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* 支付按钮 */}
                  <button onClick={handleBuy} disabled={ordering || selectedProduct.stock <= 0} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: '#007AFF', color: '#fff', fontSize: 15, fontWeight: 600, cursor: ordering ? 'not-allowed' : 'pointer', opacity: ordering ? 0.6 : 1 }}>{ordering ? '处理中...' : '立即支付'}</button>

                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, fontSize: 11, color: '#34C759', display: 'flex', alignItems: 'center', gap: 6 }}>🔒 支付成功后自动发货，卡密可在订单查询中查看</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
