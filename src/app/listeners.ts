import { createListenerMiddleware, isRejectedWithValue } from '@reduxjs/toolkit';
import type { ApiError } from '../api/client';
import { logout, setToken } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import { tokenStorage } from '../utils/storage';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setToken,
  effect: (action) => tokenStorage.set(action.payload),
});

listenerMiddleware.startListening({
  actionCreator: logout,
  effect: () => tokenStorage.clear(),
});

/** Failures that their page already renders inline, or that are expected in the background. */
const SILENT_ACTION_PREFIXES = ['analysis/', 'auth/fetchMe', 'auth/fetchGithubProfile', 'repositories/fetchIndexStatus'];

listenerMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: (action, api) => {
    const error = action.payload as ApiError | undefined;
    if (!error || error.status === 401) return;
    if (SILENT_ACTION_PREFIXES.some((prefix) => action.type.startsWith(prefix))) return;
    api.dispatch(showToast({ tone: 'error', title: 'Request failed', message: error.message }));
  },
});
