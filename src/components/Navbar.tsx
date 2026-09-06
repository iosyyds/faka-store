'use client';
import React, { useState, useEffect } from 'react';

const NAV_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export default function Navbar({ buttonText, buttonHref }: { buttonText: string; buttonHref: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
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
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .nav-title {
          background: linear-gradient(135deg, #007AFF 0%, #5856D6 50%, #AF52DE 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
          transition: all 0.3s ease;
        }
        .nav-title:hover {
          filter: drop-shadow(0 0 8px rgba(0,122,255,0.3));
        }
      `}</style>
      <div style={{
        maxWidth: 980, height: 52, margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: 52 }}
          onClick={() => { window.location.href = '/'; }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img src="/logo.png" alt="logo" style={{
            width: 28, height: 28, borderRadius: 7, objectFit: 'cover', display: 'block',
            transition: 'transform 0.3s ease',
            transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)'
          }} />
          <span className="nav-title" style={{
            fontSize: 17, fontWeight: 600, lineHeight: '20px', display: 'block',
            margin: 0, padding: 0, fontFamily: NAV_FONT, letterSpacing: -0.3
          }}>甜甜发卡</span>
        </div>
        <button onClick={() => { window.location.href = buttonHref; }} style={{
          width: 80, height: 32, padding: 0, borderRadius: 980,
          background: 'linear-gradient(135deg, #007AFF, #5856D6)',
          color: '#fff', border: 'none',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: NAV_FONT,
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,122,255,0.2)'
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,122,255,0.2)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,122,255,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,122,255,0.2)'; }}
        >{buttonText}</button>
      </div>
    </nav>
  );
}
