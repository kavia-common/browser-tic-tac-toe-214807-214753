import { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * usePlayerIdentity
 * A lightweight hook to collect/store a display name in localStorage.
 * - If not present, provides a setter so UI can prompt user once per session.
 * - Returns { name, setName, hasName }
 */
export function usePlayerIdentity(storageKey = 'ttt_display_name') {
  /** This is a public function. */
  const [name, setNameState] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });

  const hasName = !!name && name.trim().length > 0;

  const setName = (n) => {
    setNameState(n);
    try {
      localStorage.setItem(storageKey, n);
    } catch {
      // ignore storage errors
    }
  };

  // Keep state synced if multiple tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === storageKey) {
        setNameState(e.newValue || '');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  return { name, setName, hasName };
}
