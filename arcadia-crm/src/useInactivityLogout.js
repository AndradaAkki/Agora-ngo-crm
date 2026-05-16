import { useEffect, useRef } from 'react';

const TIMEOUT_MS = 30 * 1000; // 30 minutes
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export function useInactivityLogout(currentUser, onLogout) {
  const timer = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const reset = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        localStorage.removeItem('arcadia_token');
        localStorage.removeItem('arcadia_user');
        onLogout();
      }, TIMEOUT_MS);
    };

    reset();
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));

    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [currentUser, onLogout]);
}
