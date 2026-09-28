import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { ApiError } from '../../api/client';
import type { RootState } from '../../app/store';
import type { LoadStatus } from '../../types/async';
import type { GeminiKeyStatus } from '../../types/user';
import { deleteGeminiKey, fetchGeminiKeyStatus, saveGeminiKey } from './settingsThunks';

interface SettingsState {
  geminiKey: GeminiKeyStatus | null;
  status: LoadStatus;
  mutation: 'idle' | 'saving' | 'deleting';
  error: ApiError | null;
}

const initialState: SettingsState = { geminiKey: null, status: 'idle', mutation: 'idle', error: null };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeminiKeyStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGeminiKeyStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.geminiKey = action.payload;
      })
      .addCase(fetchGeminiKeyStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(saveGeminiKey.pending, (state) => {
        state.mutation = 'saving';
        state.error = null;
      })
      .addCase(deleteGeminiKey.pending, (state) => {
        state.mutation = 'deleting';
        state.error = null;
      })
      .addMatcher(isAnyOf(saveGeminiKey.fulfilled, deleteGeminiKey.fulfilled), (state, action) => {
        state.mutation = 'idle';
        state.geminiKey = { ...state.geminiKey, ...action.payload };
      })
      .addMatcher(isAnyOf(saveGeminiKey.rejected, deleteGeminiKey.rejected), (state, action) => {
        state.mutation = 'idle';
        state.error = action.payload ?? null;
      });
  },
});

export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer;
