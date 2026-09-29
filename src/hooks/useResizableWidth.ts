import { useCallback, useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react';

interface ResizableOptions {
  storageKey: string;
  initial: number;
  min: number;
  max: number;
  /** `left` when the handle sits on the panel's left edge (dragging left widens it). */
  edge?: 'left' | 'right';
}

const readStored = (key: string, fallback: number) => {
  const stored = Number(window.localStorage.getItem(key));
  return Number.isFinite(stored) && stored > 0 ? stored : fallback;
};

/** A panel width the user can drag, persisted in localStorage. */
export function useResizableWidth({ storageKey, initial, min, max, edge = 'right' }: ResizableOptions) {
  const [width, setWidth] = useState(() => Math.min(max, Math.max(min, readStored(storageKey, initial))));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(Math.round(width)));
  }, [storageKey, width]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;
      setDragging(true);

      const move = (moveEvent: PointerEvent) => {
        const delta = (moveEvent.clientX - startX) * (edge === 'right' ? 1 : -1);
        setWidth(Math.min(max, Math.max(min, startWidth + delta)));
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [edge, max, min, width],
  );

  const reset = useCallback(() => setWidth(initial), [initial]);

  return { width, dragging, onPointerDown, reset };
}
