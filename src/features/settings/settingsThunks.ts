import { createApiThunk } from '../../app/createAppThunk';
import { authApi } from '../../services/authApi';

export const fetchGeminiKeyStatus = createApiThunk('settings/fetchGeminiKeyStatus', () =>
  authApi.getGeminiKeyStatus(),
);

export const saveGeminiKey = createApiThunk('settings/saveGeminiKey', (apiKey: string) =>
  authApi.saveGeminiKey(apiKey),
);

export const deleteGeminiKey = createApiThunk('settings/deleteGeminiKey', () => authApi.deleteGeminiKey());
