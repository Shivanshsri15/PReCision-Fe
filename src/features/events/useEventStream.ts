import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { API_URL, authHeader, notifyUnauthorized } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import { readSse } from '../../api/sse';
import type { AppDispatch, RootState } from '../../app/store';
import type { AppEvent, EventsSnapshot } from '../../types/events';
import { handleAppEvent, handleSnapshot } from './eventHandlers';

const MIN_RETRY_MS = 2_000;
const MAX_RETRY_MS = 30_000;

/**
 * Keeps one SSE connection to the user's event stream open while mounted,
 * reconnecting with backoff. Every (re)connect starts with a snapshot, so
 * in-flight indexing and analyses are recovered after a refresh or outage.
 */
export function useEventStream(): void {
  const store = useStore<RootState>();

  useEffect(() => {
    const dispatch = store.dispatch as AppDispatch;
    const api = { dispatch, getState: store.getState };
    const controller = new AbortController();
    let retryMs = MIN_RETRY_MS;
    let timer: number | undefined;

    const connect = async () => {
      try {
        const response = await fetch(`${API_URL}${endpoints.events.stream}`, {
          headers: { Accept: 'text/event-stream', ...authHeader() },
          signal: controller.signal,
        });
        if (response.status === 401) {
          notifyUnauthorized();
          return;
        }
        if (!response.ok || !response.body) throw new Error(`Event stream failed (${response.status})`);

        for await (const { event, data } of readSse(response.body)) {
          if (event === 'snapshot') {
            retryMs = MIN_RETRY_MS;
            handleSnapshot(data as EventsSnapshot, api);
          } else if (event === 'message') {
            handleAppEvent(data as AppEvent, api);
          }
        }
      } catch {
        // Reconnect below.
      }
      if (controller.signal.aborted) return;
      timer = window.setTimeout(() => void connect(), retryMs);
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    };

    void connect();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [store]);
}
