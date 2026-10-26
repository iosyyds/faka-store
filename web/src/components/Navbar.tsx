'use client';
import React, { useState, useEffect } from 'react';

const NAV_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

interface NavbarProps {
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  // 兼容旧调用：buttonText / buttonHref 等价于主按钮
  buttonText?: string;
  buttonHref?: string;
}

export default function Navbar({
  primaryText, primaryHref, secondaryText, secondaryHref, buttonText, buttonHref,
}: NavbarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [titleHover, setTitleHover] = useState(false);

  const pText = primaryText ?? buttonText ?? '';
  const pHref = primaryHref ?? buttonHref ?? '/';
  const sText = secondaryText ?? '';
  const sHref = secondaryHref ?? '/';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      fontFamily: NAV_FONT,
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: 980, margin: '0 auto',
        height: isMobile ? 52 : 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 22px',
        boxSizing: 'border-box',
      }}>
        {/* 左侧：logo + 站点标题 */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => { window.location.href = '/'; }}
          onMouseEnter={() => setTitleHover(true)}
          onMouseLeave={() => setTitleHover(false)}
        >
          <img src="/logo.png" alt="logo" style={{
            width: isMobile ? 24 : 26, height: isMobile ? 24 : 26,
            borderRadius: 8, objectFit: 'cover', display: 'block',
          }} />
          <span style={{
            fontSize: isMobile ? 17 : 20, fontWeight: 700, lineHeight: 1.2,
            color: titleHover ? '#007AFF' : '#1D1D1F',
            letterSpacing: -0.4, transition: 'color 0.2s ease',
          }}>甜甜发卡</span>
        </div>

        {/* 右侧：描边次要按钮 + 蓝色实心主按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {sText && (
            <button
              onClick={() => { window.location.href = sHref; }}
              style={{
                height: isMobile ? 34 : 36, padding: '0 16px', borderRadius: 980,
                background: 'transparent', color: '#1D1D1F',
                border: '1px solid rgba(0,0,0,0.18)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: NAV_FONT, transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >{sText}</button>
          )}
          {pText && (
            <button
              onClick={() => { window.location.href = pHref; }}
              style={{
                height: isMobile ? 34 : 36, padding: '0 18px', borderRadius: 980,
                background: '#007AFF', color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: NAV_FONT, transition: 'all 0.2s ease',
                boxShadow: '0 2px 10px rgba(0,122,255,0.25)',
                whiteSpace: 'nowrap',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,122,255,0.2)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,122,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,122,255,0.25)'; }}
            >{pText}</button>
          )}
        </div>
      </div>
    </nav>
  );
}