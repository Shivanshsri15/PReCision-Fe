import { createAsyncThunk } from '@reduxjs/toolkit';
import { toApiError, type ApiError } from '../api/client';
import type { AppDispatch, RootState } from '../app/store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: ApiError;
}>();

export interface ThunkContext {
  getState: () => RootState;
  dispatch: AppDispatch;
  signal: AbortSignal;
}

export interface ApiThunkOptions<Arg> {
  /** Return false to skip the request entirely (e.g. data already loading). */
  condition?: (arg: Arg, api: { getState: () => RootState }) => boolean;
}

/** An async thunk whose failures are normalized into an `ApiError` reject value. */
export function createApiThunk<Returned, Arg = void>(
  type: string,
  request: (arg: Arg, api: ThunkContext) => Promise<Returned>,
  options?: ApiThunkOptions<Arg>,
) {
  return createAppAsyncThunk<Returned, Arg>(
    type,
    async (arg, api) => {
      try {
        return await request(arg, api);
      } catch (error) {
        return api.rejectWithValue(toApiError(error));
      }
    },
    options,
  );
}
