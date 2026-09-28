import { createApiThunk } from '../../app/createAppThunk';
import { authApi } from '../../services/authApi';
import { githubApi } from '../../services/githubApi';

/** Fetches the GitHub authorize URL and leaves the app to start OAuth. */
export const startGithubLogin = createApiThunk('auth/startGithubLogin', async () => {
  const url = await githubApi.getOAuthUrl();
  window.location.assign(url);
});

export const fetchMe = createApiThunk('auth/fetchMe', () => authApi.me());

export const fetchGithubProfile = createApiThunk('auth/fetchGithubProfile', () => githubApi.getProfile(), {
  condition: (_, { getState }) => getState().auth.profileStatus !== 'loading',
});
