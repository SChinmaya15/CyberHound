import { get } from './authService';
import { DashboardResponse } from '../types';

export async function getDashboard(tenantId: string): Promise<DashboardResponse> {
  return get<DashboardResponse>(`dashboard/tenant/${tenantId}`);
}
