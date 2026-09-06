'use client';
import React, { useState, useEffect } from 'react';

const NAV_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export default function Navbar({ buttonText, buttonHref }: { buttonText: string; buttonHref: string }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      height: 52,
      fontFamily: NAV_FONT
    }}>
      <div style={{
        maxWidth: 980, height: 52, margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: 52 }} onClick={() => { window.location.href = '/'; }}>
          <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block' }} />
          <span style={{ fontSize: 17, fontWeight: 600, lineHeight: '20px', display: 'block', margin: 0, padding: 0, fontFamily: NAV_FONT }}>甜甜发卡</span>
        </div>
        <button onClick={() => { window.location.href = buttonHref; }} style={{
          width: 80, height: 32, padding: 0, borderRadius: 980,
          background: '#007AFF', color: '#fff', border: 'none',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: NAV_FONT
        }}>{buttonText}</button>
      </div>
    </nav>
  );
}
