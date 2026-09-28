import { createApiThunk } from '../../app/createAppThunk';
import { dashboardApi } from '../../services/dashboardApi';

export const fetchDashboardStats = createApiThunk('dashboard/fetchStats', () => dashboardApi.getStats());
