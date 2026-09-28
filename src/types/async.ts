import type { ApiError } from '../api/client';

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState {
  status: LoadStatus;
  error: ApiError | null;
}

export const initialAsyncState = (): AsyncState => ({ status: 'idle', error: null });
