import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
}

interface UiState {
  toasts: Toast[];
  sidebarOpen: boolean;
}

const initialState: UiState = { toasts: [], sidebarOpen: false };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts = [...state.toasts.slice(-3), action.payload];
      },
      prepare: (toast: Omit<Toast, 'id'>) => ({ payload: { ...toast, id: nanoid() } }),
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { showToast, dismissToast, setSidebarOpen } = uiSlice.actions;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export default uiSlice.reducer;
