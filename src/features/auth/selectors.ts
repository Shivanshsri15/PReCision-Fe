import type { RootState } from '../../app/store';

export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token);
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserStatus = (state: RootState) => state.auth.userStatus;
export const selectGithubProfile = (state: RootState) => state.auth.profile;
export const selectLoginStatus = (state: RootState) => state.auth.loginStatus;
export const selectAuthError = (state: RootState) => state.auth.error;

/** Best available display name: GitHub name, then login, then email. */
export const selectDisplayName = (state: RootState) =>
  state.auth.profile?.name ||
  state.auth.profile?.login ||
  state.auth.user?.githubUsername ||
  state.auth.user?.email ||
  'there';

export const selectLogin = (state: RootState) =>
  state.auth.profile?.login ?? state.auth.user?.githubUsername ?? '';
