import { useState, useEffect } from 'react';

let globalSession: { role?: string; name?: string } | null = null;
let isFetched = false;

export function useSession() {
  const [session, setSession] = useState<{ role?: string; name?: string } | null>(globalSession);
  const [loading, setLoading] = useState(!isFetched);

  useEffect(() => {
    if (isFetched) {
      setSession(globalSession);
      setLoading(false);
      return;
    }

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        globalSession = data.session || null;
        isFetched = true;
        setSession(globalSession);
        setLoading(false);
      })
      .catch(() => {
        isFetched = true;
        setLoading(false);
      });
  }, []);

  return { session, loading };
}
