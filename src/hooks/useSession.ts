import { useState, useEffect } from 'react';

export function useSession() {
  const [session, setSession] = useState<{ role?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data.session || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { session, loading };
}
