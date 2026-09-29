import { useEffect, useState, type ReactNode } from 'react';
import { useServerStatus } from '../../hooks/useServerStatus';
import { WakeScreen } from './WakeScreen';

/** A warm server answers well within this, so it never flashes the wake screen. */
const SHOW_DELAY_MS = 600;
const CELEBRATE_MS = 1200;

/** Holds the app until the API responds, so no page makes calls to a sleeping server. */
export function ServerGate({ children }: { children: ReactNode }) {
  const status = useServerStatus();
  const ready = status === 'ready';
  const [visible, setVisible] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready || !visible) return;
    const timer = window.setTimeout(() => setCelebrated(true), CELEBRATE_MS);
    return () => window.clearTimeout(timer);
  }, [ready, visible]);

  if (skipped || (ready && (!visible || celebrated))) return <>{children}</>;
  if (!visible) return null;
  return <WakeScreen ready={ready} onSkip={() => setSkipped(true)} />;
}
