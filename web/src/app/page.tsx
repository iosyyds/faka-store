'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';

const API_BASE = 'https://kk.qqqi.top/api';

interface Product {
  id: number; name: string; description: string; price: string; original_price: string | null;
  category_id: number; category_name: string; image: string; stock: number; sales: number;
  is_hot: number; is_top: number; has_spec: number; status: number; tag?: string;
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showBuy, setShowBuy] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [contact, setContact] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [polling, setPolling] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadData();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const loadData = async () => {
    try {
      const cached = localStorage.getItem('faka_cache');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.products) setProducts(data.products);
          if (data.site) setSite(data.site);
          if (data.categories) setCategories(data.categories);
          setLoading(false);
        } catch {}
      }
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
      setProducts(prods);
      setSite(st);
      setCategories(cats);
      setLoading(false);
      try { localStorage.setItem('faka_cache', JSON.stringify({ products: prods, site: st, categories: cats, timestamp: Date.now() })); } catch {}
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory !== 'all' && p.category_name !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openBuy = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOrder(null);
    setQrCode('');
    setErrMsg('');
    setShowBuy(true);
  };

  const handleBuy = async () => {
    if (!contact.trim()) { setErrMsg('请输入联系方式（手机号/邮箱/QQ）'); return; }
    if (!selectedProduct) return;
    setOrdering(true);
    setErrMsg('');
    try {
      const res = await fetch(`${API_BASE}/order_create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: selectedProduct.id, quantity, contact: contact.trim() }),
      });
      const data = await res.json();
      if (data.code === 0 && data.data) {
        const ord: OrderInfo = {
          order_no: data.data.order_no, product_name: selectedProduct.name, spec_name: '',
          quantity, total_amount: data.data.total_amount, status: 0, paid_at: null,
          created_at: new Date().toISOString(), cards: [], contact: contact.trim(),
          query_pwd: data.data.query_pwd,
        };
        setOrder(ord);
        if (data.data.qr_code) {
          setQrCode(data.data.qr_code);
          startPolling(data.data.order_no, data.data.query_pwd);
        }
      } else {
        setErrMsg(data.msg || '下单失败');
      }
    } catch (e) {
      setErrMsg('下单失败，请重试');
    } finally {
      setOrdering(false);
    }
  };

  const startPolling = (orderNo: string, pwd: string) => {
    setPolling(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= 120) { if (pollRef.current) clearInterval(pollRef.current); setPolling(false); return; }
      try {
        const res = await fetch(`${API_BASE}/order_query.php?order_no=${orderNo}&pwd=${pwd}`);
        const data = await res.json();
        if (data.code === 0 && data.data) {
          const ord = data.data as OrderInfo;
          if (ord.status === 1) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPolling(false);
            setOrder(ord);
            setQrCode('');
          } else if (ord.status === 2) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPolling(false);
            setErrMsg('订单已取消');
          }
        }
      } catch {}
    }, 2500);
  };

  const copyCard = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  const closeModal = () => {
    setShowBuy(false);
    setOrder(null);
    setQrCode('');
    setErrMsg('');
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav className="nav-responsive">
        <div className="nav-inner-responsive">
          <div className="nav-left-responsive">
            <div className="nav-logo-responsive" onClick={() => router.push('/')}>
              {site.site_logo ? (
                <img src={site.site_logo} alt="Logo" className="nav-logo-img-responsive" />
              ) : (
                <div className="nav-logo-icon-responsive">{site.site_name?.[0] || '甜'}</div>
              )}
              <span className="nav-logo-text-responsive">{site.site_name || '甜甜发卡'}</span>
            </div>
            <div className="nav-search-responsive">
              <span className="nav-search-icon-responsive"><Icon name="search" size={16} /></span>
              <input type="text" placeholder="搜索商品..." value={search} onChange={(e) => setSearch(e.target.value)} className="nav-search-input-responsive" />
            </div>
          </div>
          <div className="nav-right-responsive">
            <button className="btn-primary-responsive" onClick={() => router.push('/query')}>订单查询</button>
          </div>
          <div className="nav-search-mobile-responsive">
            <span className="nav-search-icon-responsive"><Icon name="search" size={16} /></span>
            <input type="text" placeholder="搜索商品..." value={search} onChange={(e) => setSearch(e.target.value)} className="nav-search-input-responsive" />
          </div>
        </div>
      </nav>

      <div className="container-responsive">
        <div className="hero-banner-responsive">
          <div className="hero-banner-left-responsive">
            <h1 className="hero-banner-title-responsive">{site.banner_title || '虚拟商品·即拍即发'}</h1>
            <p className="hero-banner-subtitle-responsive">{site.banner_subtitle || '支付宝多渠道支付，付款后自动秒发卡密'}</p>
            <div className="hero-banner-tags-responsive">
              <span className="hero-banner-tag-responsive"><span className="hero-banner-tag-icon-responsive"><Icon name="check" size={12} /></span>{site.banner_tag1 || '自动秒发'}</span>
              <span className="hero-banner-tag-responsive"><span className="hero-banner-tag-icon-responsive"><Icon name="key" size={12} /></span>{site.banner_tag2 || '加密存储'}</span>
              <span className="hero-banner-tag-responsive"><span className="hero-banner-tag-icon-responsive"><Icon name="money" size={12} /></span>{site.banner_tag3 || '多渠道支付'}</span>
            </div>
          </div>
          <div className="hero-banner-flower-responsive">
            <svg viewBox="0 0 100 100" className="hero-banner-flower-svg-responsive">
              <circle cx="50" cy="50" r="8" fill="#fff" opacity="0.9" />
              <ellipse cx="50" cy="25" rx="12" ry="18" fill="#FFB7C5" opacity="0.7" />
              <ellipse cx="50" cy="75" rx="12" ry="18" fill="#FFB7C5" opacity="0.7" />
              <ellipse cx="25" cy="50" rx="18" ry="12" fill="#FFB7C5" opacity="0.7" />
              <ellipse cx="75" cy="50" rx="18" ry="12" fill="#FFB7C5" opacity="0.7" />
              <ellipse cx="32" cy="32" rx="14" ry="10" fill="#FFC0CB" opacity="0.6" transform="rotate(-45 32 32)" />
              <ellipse cx="68" cy="32" rx="14" ry="10" fill="#FFC0CB" opacity="0.6" transform="rotate(45 68 32)" />
              <ellipse cx="32" cy="68" rx="14" ry="10" fill="#FFC0CB" opacity="0.6" transform="rotate(45 32 68)" />
              <ellipse cx="68" cy="68" rx="14" ry="10" fill="#FFC0CB" opacity="0.6" transform="rotate(-45 68 68)" />
            </svg>
          </div>
        </div>

        <div className="category-tabs-responsive">
          <div className={`category-tab-responsive ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>全部商品</div>
          {categories.map((cat, i) => (
            <div key={i} className={`category-tab-responsive ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</div>
          ))}
        </div>

        {loading ? (
          <div className="empty-responsive"><div style={{ marginBottom: '12px', color: '#9ca3af' }}><Icon name="refresh" size={32} /></div>加载中...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-card-responsive"><div style={{ marginBottom: '12px', opacity: 0.5, color: '#9ca3af' }}><Icon name="box" size={48} /></div><div style={{ fontSize: '14px', color: '#6b7280' }}>暂无商品</div></div>
        ) : (
          <div className="product-grid-responsive">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-card-responsive" onClick={() => openBuy(p)}>
                <div className="product-card-img-responsive">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="product-card-image-responsive" />
                  ) : (
                    <div className="product-card-placeholder-responsive">
                      <div className="product-card-placeholder-pattern"></div>
                      <div className="product-card-placeholder-icon">🎁</div>
                    </div>
                  )}
                  <div className="product-card-overlay-responsive"></div>
                  <div className="product-card-badges-responsive">
                    <div className="product-card-badge-responsive">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                      自动发卡
                    </div>
                    {p.is_hot ? <div className="product-card-tag-responsive">热门</div> : null}
                  </div>
                  {p.stock === 0 && (
                    <div className="product-card-soldout-mask-responsive"><div className="product-card-soldout-text-responsive">已售罄</div></div>
                  )}
                </div>
                <div className="product-card-body-responsive">
                  <div className="product-card-name-row-responsive">
                    <div className="product-card-name-responsive">{p.name}</div>
                    <div className="product-card-stock-badge-responsive">
                      <span className={`stock-dot ${p.stock > 0 ? 'active' : ''}`}></span>
                      {p.stock > 0 ? `库存${p.stock}` : '缺货'}
                    </div>
                  </div>
                  {p.stock > 0 && (
                    <div className="product-card-stock-bar-responsive">
                      <div className="product-card-stock-progress-responsive" style={{ width: `${Math.min(100, p.stock * 10)}%` }}></div>
                    </div>
                  )}
                  <div className="product-card-info-row-responsive">
                    <div className="product-card-price-wrapper-responsive">
                      <span className="product-card-price-responsive">
                        <span className="product-card-price-symbol-responsive">¥</span>
                        {Number(p.price).toFixed(2)}
                      </span>
                      {p.original_price && Number(p.original_price) > Number(p.price) && (
                        <span className="product-card-original-price-responsive">¥{Number(p.original_price).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="product-card-sales-responsive">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                      {p.sales || 0}人已购
                    </div>
                  </div>
                  <div className="product-card-action-responsive">
                    <span className="product-card-buy-text-responsive">立即购买</span>
                    <div className="product-card-buy-btn-responsive">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer-responsive">
        <div className="footer-inner-responsive">
          <div className="footer-top-responsive">
            <div className="footer-left-responsive">
              <div className="footer-brand-responsive">{site.site_name || '甜甜发卡'}</div>
              <div className="footer-desc-responsive">{site.footer_desc || '本站仅出售合规虚拟商品，下单即视为同意服务条款。'}</div>
            </div>
            <div className="footer-right-responsive">
              <a href="/faq" className="footer-link-responsive">常见问题</a>
              <a href="/after-sale" className="footer-link-responsive">售后反馈</a>
              {site.customer_service && <a href="#" className="footer-link-responsive">客服：{site.customer_service}</a>}
            </div>
          </div>
          <div className="footer-bottom-responsive">
            © {new Date().getFullYear()} {site.site_name || '甜甜发卡'}. {site.copyright || ''}
            {site.icp_number && <span style={{ marginLeft: '12px' }}>{site.icp_number}</span>}
          </div>
        </div>
      </footer>

      {showBuy && selectedProduct && (
        <div className="modal-overlay-responsive" onClick={closeModal}>
          <div className="modal-responsive" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-responsive">
              <div className="modal-title-responsive">
                {order?.status === 1 ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#059669' }}>✓</span> 支付结果</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="cart" size={16} style={{ marginRight: '6px' }} /> 确认订单</span>
                )}
              </div>
              <div className="modal-close-responsive" onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
            </div>

            <div className="modal-body-responsive">
              {qrCode && order && order.status === 0 ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>请使用支付宝扫码支付</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>订单号：<span style={{ fontFamily: 'monospace' }}>{order.order_no}</span></div>
                  <div style={{ width: '200px', height: '200px', margin: '0 auto 16px', padding: '12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}`} alt="支付二维码" style={{ width: '180px', height: '180px' }} />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '14px', color: '#1e40af', marginBottom: '12px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                    等待支付中...
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>¥{order.total_amount}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>查询密码：{order.query_pwd}（请保存）</div>
                </div>
              ) : order?.status === 1 ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="success-icon-responsive">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>支付成功</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>订单号：<span style={{ fontFamily: 'monospace', color: '#111827' }}>{order.order_no}</span></p>
                  <div className="order-info-responsive">
                    <div className="order-info-row-responsive"><span>商品名称</span><span style={{ fontWeight: 500, color: '#111827' }}>{order.product_name}</span></div>
                    <div className="order-info-row-responsive"><span>支付金额</span><span style={{ fontWeight: 600, color: '#2563eb' }}>¥{order.total_amount}</span></div>
                    <div className="order-info-row-responsive"><span>联系方式</span><span style={{ color: '#111827' }}>{order.contact}</span></div>
                  </div>
                  {order.cards && order.cards.length > 0 && (
                    <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '10px' }}>🎫 您的卡密 ({order.cards.length}条)</div>
                      {order.cards.map((card, i) => (
                        <div key={i} className="card-item-responsive">
                          <span className="card-index-responsive">{i + 1}</span>
                          <span className="card-content-responsive">{card.content}</span>
                          <button className="card-copy-btn-responsive" onClick={() => copyCard(card.content)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            复制
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="modal-product-card-responsive">
                    <div className="modal-product-img-responsive">
                      {selectedProduct.image ? <img src={selectedProduct.image} alt={selectedProduct.name} /> : <span>🎁</span>}
                    </div>
                    <div className="modal-product-detail-responsive">
                      <div className="modal-product-name-responsive">{selectedProduct.name}</div>
                      <div className="modal-product-meta-responsive">
                        <span className="modal-product-price-responsive"><span className="modal-product-price-symbol-responsive">¥</span>{selectedProduct.price}</span>
                        {selectedProduct.original_price && Number(selectedProduct.original_price) > Number(selectedProduct.price) && (
                          <span className="modal-product-original-price-responsive">¥{Number(selectedProduct.original_price).toFixed(2)}</span>
                        )}
                      </div>
                      <div className="modal-product-stock-responsive">
                        <span className={`stock-dot-responsive ${selectedProduct.stock > 0 ? 'in-stock' : 'out-stock'}`}></span>
                        {selectedProduct.stock > 0 ? `库存充足 (${selectedProduct.stock}件)` : '已售罄'}
                      </div>
                    </div>
                  </div>

                  <div className="form-group-responsive">
                    <label className="form-label-responsive"><Icon name="user" size={14} style={{ marginRight: '4px' }} />联系方式<span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '6px' }}>用于查询订单和卡密</span></label>
                    <div className="input-wrapper-responsive">
                      <span className="input-icon-responsive"><Icon name="user" size={16} /></span>
                      <input type="text" placeholder="手机号 / 邮箱 / QQ号" value={contact} onChange={(e) => setContact(e.target.value)} className="form-input-with-icon-responsive" />
                    </div>
                  </div>

                  <div className="form-group-responsive">
                    <label className="form-label-responsive"><Icon name="box" size={14} style={{ marginRight: '4px' }} />购买数量</label>
                    <div className="quantity-wrapper-responsive">
                      <div className="quantity-selector-responsive">
                        <button className="quantity-btn-responsive" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className="quantity-value-responsive">{quantity}</span>
                        <button className="quantity-btn-responsive" onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>
                      <span style={{ marginLeft: '12px', fontSize: '13px', color: '#9ca3af', alignSelf: 'center', lineHeight: '38px', height: '38px', display: 'flex', alignItems: 'center' }}>最多可买 {selectedProduct.stock} 件</span>
                    </div>
                  </div>

                  <div className="form-group-responsive">
                    <label className="form-label-responsive"><Icon name="money" size={14} style={{ marginRight: '4px' }} />支付方式</label>
                    <div className="pay-methods-responsive">
                      <div className="pay-method-item-responsive active">
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>支</div>
                        <span className="pay-name-responsive">支付宝</span>
                        <span className="pay-check-responsive">✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-total-responsive">
                    <div className="modal-total-left-responsive">
                      <span className="modal-total-label-responsive">合计金额</span>
                      <span className="modal-total-count-responsive">共 {quantity} 件</span>
                    </div>
                    <div className="modal-total-right-responsive">
                      <span className="modal-total-symbol-responsive">¥</span>
                      <span className="modal-total-price-responsive">{(Number(selectedProduct.price) * quantity).toFixed(2)}</span>
                    </div>
                  </div>

                  {errMsg && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>{errMsg}</div>}

                  <div className="modal-buttons-responsive">
                    <button className="modal-cancel-inline-responsive" onClick={closeModal}>取消</button>
                    <button onClick={handleBuy} disabled={ordering || selectedProduct.stock <= 0} className="modal-submit-responsive">
                      {ordering ? (<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="btn-spinner-responsive"></span>处理中...</span>) : '立即支付'}
                    </button>
                  </div>

                  <div className="security-tip-responsive">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>支付成功后自动发货，卡密在页面显示并可在订单查询中查看</span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer-responsive">
              {qrCode && order?.status === 0 ? (
                <button className="modal-cancel-btn-responsive" onClick={closeModal}>取消支付</button>
              ) : order?.status === 1 ? (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button className="modal-cancel-btn-responsive" style={{ flex: 1 }} onClick={closeModal}>关闭</button>
                  <button className="modal-query-btn-responsive" style={{ flex: 1 }} onClick={() => { closeModal(); router.push('/query'); }}><Icon name="list" size={16} style={{ marginRight: '6px' }} />订单查询</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
