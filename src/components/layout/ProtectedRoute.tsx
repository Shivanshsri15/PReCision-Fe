import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { fetchGithubProfile, fetchMe } from '../../features/auth/authThunks';
import { selectAuthError, selectIsAuthenticated, selectUserStatus } from '../../features/auth/selectors';
import { fetchGeminiKeyStatus } from '../../features/settings/settingsThunks';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { PageSpinner } from '../ui/Spinner';

/** Requires a token and bootstraps the session (user, GitHub profile, Gemini key status). */
export function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userStatus = useAppSelector(selectUserStatus);
  const error = useAppSelector(selectAuthError);

  useEffect(() => {
    if (!isAuthenticated || userStatus !== 'idle') return;
    void dispatch(fetchMe());
    void dispatch(fetchGithubProfile());
    void dispatch(fetchGeminiKeyStatus());
  }, [dispatch, isAuthenticated, userStatus]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (userStatus === 'failed') {
    return (
      <EmptyState
        className="min-h-screen"
        tone="error"
        icon={AlertTriangle}
        title="Could not load your session"
        description={error?.message}
        action={
          <div className="flex gap-2">
            <Button onClick={() => void dispatch(fetchMe())}>Retry</Button>
            <Button variant="secondary" onClick={() => dispatch(logout())}>
              Sign out
            </Button>
          </div>
        }
      />
    );
  }

  if (userStatus !== 'succeeded') return <PageSpinner label="Loading your workspace…" />;

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
