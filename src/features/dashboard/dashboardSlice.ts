import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { initialAsyncState, type AsyncState } from '../../types/async';
import type { DashboardStats } from '../../types/review';
import { fetchDashboardStats } from './dashboardThunks';

interface DashboardState extends AsyncState {
  stats: DashboardStats | null;
}

const initialState: DashboardState = { ...initialAsyncState(), stats: null };

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      });
  },
});

export const selectDashboard = (state: RootState) => state.dashboard;
export default dashboardSlice.reducer;
