export interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  email: string;
  plan: string;
  planStatus: string;
  expiry: string;
  isInactive: boolean;
  selected: boolean;
  statusTag: string;
}
