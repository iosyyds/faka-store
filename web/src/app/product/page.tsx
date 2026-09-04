'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9ca3af', fontSize: 14 }}>跳转中...</div>
    </div>
  );
}
