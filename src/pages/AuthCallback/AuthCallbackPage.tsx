import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { setAuthError, setToken } from '../../features/auth/authSlice';
import { PageSpinner } from '../../components/ui/Spinner';

/** Receives `#token=` (or `#error=`) from the backend OAuth redirect. */
export function AuthCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token');
    window.history.replaceState(null, '', window.location.pathname);

    if (token) {
      dispatch(setToken(token));
      navigate('/', { replace: true });
    } else {
      dispatch(setAuthError(params.get('error') ?? 'GitHub sign-in did not return a session.'));
      navigate('/login', { replace: true });
    }
  }, [dispatch, navigate]);

  return <PageSpinner label="Signing you in…" />;
}
