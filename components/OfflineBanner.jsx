import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: 'var(--ink)', color: 'white',
      padding: '12px 20px', borderRadius: 'var(--r-md)',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: 'var(--shadow-xl)', fontSize: 14, fontWeight: 500,
      animation: 'fadeUp 0.25s ease',
    }}>
      <WifiOff size={16} color="#F59E0B" />
      You're offline — some features may not work until you reconnect.
    </div>
  );
}
