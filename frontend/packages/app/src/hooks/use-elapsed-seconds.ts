import { useEffect, useState } from 'react';

export function useElapsedSeconds(startedAt: Date | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return 0;
  return Math.floor((now - startedAt.getTime()) / 1000);
}
