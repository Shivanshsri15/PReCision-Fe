import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute, PublicOnlyRoute } from '../components/layout/ProtectedRoute';
import { GEMINI_SETUP_PATH, RequireGeminiKey } from '../components/layout/RequireGeminiKey';
import { AnalyzingPage } from '../pages/Analyzing/AnalyzingPage';
import { AuthCallbackPage } from '../pages/AuthCallback/AuthCallbackPage';
import { LoginPage } from '../pages/Login/LoginPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';
import { OverviewPage } from '../pages/Overview/OverviewPage';
import { PullRequestDetailPage } from '../pages/PullRequestDetail/PullRequestDetailPage';
import { ContextTab } from '../pages/PullRequestDetail/tabs/ContextTab';
import { DiffTab } from '../pages/PullRequestDetail/tabs/DiffTab';
import { FindingsTab } from '../pages/PullRequestDetail/tabs/FindingsTab';
import { OverviewTab } from '../pages/PullRequestDetail/tabs/OverviewTab';
import { RunsTab } from '../pages/PullRequestDetail/tabs/RunsTab';
import { PullRequestsPage } from '../pages/PullRequests/PullRequestsPage';
import { RepositoriesPage } from '../pages/Repositories/RepositoriesPage';
import { ReviewHistoryPage } from '../pages/Reviews/ReviewHistoryPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { GeminiKeySetupPage } from '../pages/Setup/GeminiKeySetupPage';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: GEMINI_SETUP_PATH, element: <GeminiKeySetupPage /> },
      {
        element: <RequireGeminiKey />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <OverviewPage /> },
              { path: 'repositories', element: <RepositoriesPage /> },
              { path: 'pull-requests', element: <PullRequestsPage /> },
              {
                path: 'repos/:owner/:repo/pulls/:number',
                element: <PullRequestDetailPage />,
                children: [
                  { index: true, element: <OverviewTab /> },
                  { path: 'findings', element: <FindingsTab /> },
                  { path: 'diff', element: <DiffTab /> },
                  { path: 'context', element: <ContextTab /> },
                  { path: 'runs', element: <RunsTab /> },
                ],
              },
              { path: 'repos/:owner/:repo/pulls/:number/analyze', element: <AnalyzingPage /> },
              { path: 'reviews', element: <ReviewHistoryPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
