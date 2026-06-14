import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 200;

export function useDelayedLoading(loading: boolean, delay = DEFAULT_DELAY_MS) {
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setDelayedLoading(false);
      return;
    }

    const timeout = setTimeout(() => setDelayedLoading(true), delay);
    return () => clearTimeout(timeout);
  }, [loading, delay]);

  return delayedLoading;
}
