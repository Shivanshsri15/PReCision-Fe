import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { setUnauthorizedHandler } from '../api/client';
import authReducer, { logout } from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import indexJobsReducer from '../features/events/indexJobsSlice';
import pullRequestsReducer from '../features/pullRequests/pullRequestsSlice';
import repositoriesReducer from '../features/repositories/repositoriesSlice';
import analysisReducer from '../features/reviews/analysisSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import uiReducer from '../features/ui/uiSlice';
import { listenerMiddleware } from './listeners';

const appReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  repositories: repositoriesReducer,
  pullRequests: pullRequestsReducer,
  reviews: reviewsReducer,
  analysis: analysisReducer,
  settings: settingsReducer,
  indexJobs: indexJobsReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof appReducer>;

/** Signing out drops every cached slice so the next user starts clean. */
const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState =>
  appReducer(logout.match(action) ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;

setUnauthorizedHandler(() => {
  if (store.getState().auth.token) store.dispatch(logout());
});
