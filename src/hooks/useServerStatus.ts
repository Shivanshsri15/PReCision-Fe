import { useEffect, useState } from 'react';
import { API_URL } from '../api/client';

const PING_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 3_000;

export type ServerStatus = 'checking' | 'waking' | 'ready';

/**
 * Pings the API root until it answers. Free-tier hosts sleep when idle and
 * take up to a minute to wake, so the app waits here instead of failing.
 */
export function useServerStatus(): ServerStatus {
  const [status, setStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;
    let controller: AbortController | undefined;

    const ping = async () => {
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), PING_TIMEOUT_MS);
      try {
        const response = await fetch(`${API_URL}/`, { cache: 'no-store', signal: controller.signal });
        if (response.status < 500) {
          if (!cancelled) setStatus('ready');
          return;
        }
      } catch {
        // Not reachable yet; retry below.
      } finally {
        window.clearTimeout(timeout);
      }
      if (cancelled) return;
      setStatus('waking');
      retryTimer = window.setTimeout(() => void ping(), RETRY_DELAY_MS);
    };

    void ping();
    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      controller?.abort();
    };
  }, []);

  return status;
}
