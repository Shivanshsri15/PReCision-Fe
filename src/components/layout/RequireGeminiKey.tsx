import { AlertTriangle } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSettings } from '../../features/settings/settingsSlice';
import { fetchGeminiKeyStatus } from '../../features/settings/settingsThunks';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { PageSpinner } from '../ui/Spinner';

export const GEMINI_SETUP_PATH = '/setup/gemini-key';

/** Keeps the app behind onboarding until the user has saved their own Gemini key. */
export function RequireGeminiKey() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { geminiKey, status, error } = useAppSelector(selectSettings);

  if (!geminiKey && status === 'failed') {
    return (
      <EmptyState
        className="min-h-screen"
        tone="error"
        icon={AlertTriangle}
        title="Could not check your Gemini key"
        description={error?.message}
        action={<Button onClick={() => void dispatch(fetchGeminiKeyStatus())}>Retry</Button>}
      />
    );
  }

  if (!geminiKey) return <PageSpinner label="Loading your workspace…" />;

  if (!geminiKey.configured) {
    return <Navigate to={GEMINI_SETUP_PATH} replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
