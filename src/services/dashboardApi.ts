import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { DashboardStats } from '../types/review';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>(endpoints.codeReview.stats);
    return data;
  },
};
