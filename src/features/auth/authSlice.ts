import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ApiError } from '../../api/client';
import type { LoadStatus } from '../../types/async';
import type { GithubProfile, User } from '../../types/user';
import { tokenStorage } from '../../utils/storage';
import { fetchGithubProfile, fetchMe, startGithubLogin } from './authThunks';

interface AuthState {
  token: string | null;
  user: User | null;
  userStatus: LoadStatus;
  profile: GithubProfile | null;
  profileStatus: LoadStatus;
  loginStatus: LoadStatus;
  error: ApiError | null;
}

const initialState = (): AuthState => ({
  token: tokenStorage.get(),
  user: null,
  userStatus: 'idle',
  profile: null,
  profileStatus: 'idle',
  loginStatus: 'idle',
  error: null,
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.user = null;
      state.userStatus = 'idle';
      state.error = null;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = { status: 401, message: action.payload };
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.userStatus = 'idle';
      state.profile = null;
      state.profileStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startGithubLogin.pending, (state) => {
        state.loginStatus = 'loading';
        state.error = null;
      })
      .addCase(startGithubLogin.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(fetchMe.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(fetchGithubProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchGithubProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchGithubProfile.rejected, (state) => {
        state.profileStatus = 'failed';
      });
  },
});

export const { setToken, setAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
