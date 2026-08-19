import { useEffect, useState } from 'react';
import client from './client';

export function useConstants() {
  const [constants, setConstants] = useState({ regions: [], niches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/constants')
      .then(({ data }) => setConstants(data))
      .finally(() => setLoading(false));
  }, []);

  return { ...constants, loading };
}
