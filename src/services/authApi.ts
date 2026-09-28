import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { GeminiKeyStatus, User } from '../types/user';

export const authApi = {
  async me(): Promise<User> {
    const { data } = await apiClient.get<User>(endpoints.auth.me);
    return data;
  },

  async getGeminiKeyStatus(): Promise<GeminiKeyStatus> {
    const { data } = await apiClient.get<GeminiKeyStatus>(endpoints.auth.geminiKey);
    return data;
  },

  async saveGeminiKey(apiKey: string): Promise<GeminiKeyStatus> {
    const { data } = await apiClient.put<GeminiKeyStatus>(endpoints.auth.geminiKey, { apiKey });
    return data;
  },

  async deleteGeminiKey(): Promise<GeminiKeyStatus> {
    const { data } = await apiClient.delete<GeminiKeyStatus>(endpoints.auth.geminiKey);
    return data;
  },
};
