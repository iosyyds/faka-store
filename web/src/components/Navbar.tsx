'use client';
import React from 'react';

interface NavbarProps {
  buttonText: string;
  buttonHref: string;
  isMobile: boolean;
}

const Navbar = React.memo(function Navbar({ buttonText, buttonHref, isMobile }: NavbarProps) {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.85)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: isMobile ? '0 16px' : '0 22px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: 52 }} onClick={() => { window.location.href = '/'; }}>
          <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 600, display: 'block', lineHeight: 1, margin: 0, padding: 0, whiteSpace: 'nowrap' }}>甜甜发卡</span>
        </div>
        <button onClick={() => { window.location.href = buttonHref; }} style={{ width: 80, height: 32, padding: 0, borderRadius: 980, background: '#007AFF', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{buttonText}</button>
      </div>
    </nav>
  );
});

export default Navbar;
