import { useState, useEffect } from 'react';
import { subscribeToThreads } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';

export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) { setCount(0); return; }
    const unsub = subscribeToThreads(user.uid, threads => {
      const total = threads.reduce((sum, t) => sum + (t[`unread_${user.uid}`] || 0), 0);
      setCount(total);
    });
    return () => { try { unsub(); } catch {} };
  }, [user]);

  return count;
}