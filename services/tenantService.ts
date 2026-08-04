import { get } from './authService';
import { toObjectIdHex } from './objectId';
import { Tenant } from '../pages/tenants/types';

type RawTenant = Record<string, any>;

const getTenantId = (tenant: RawTenant, index: number): string => {
  if (tenant.id && typeof tenant.id === 'object') {
    const hex = toObjectIdHex(tenant.id);
    if (hex) {
      return hex;
    }
  }

  if (typeof tenant.id === 'string' && tenant.id) {
    return tenant.id;
  }

  if (typeof tenant.tenantId === 'string' && tenant.tenantId) {
    return tenant.tenantId;
  }

  return `tenant-${index + 1}`;
};

const getFirstString = (record: RawTenant, keys: string[], fallback = ''): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }

  return fallback;
};

const formatDate = (value: unknown): string => {
  if (!value) {
    return 'No expiry';
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-US');
};

const getStatusTag = (tenant: RawTenant, expiry: string, isInactive: boolean): string => {
  const explicitStatus = getFirstString(tenant, ['statusTag', 'status', 'tenantStatus']);
  if (explicitStatus) {
    return explicitStatus;
  }

  if (expiry !== 'No expiry' && new Date(expiry) < new Date()) {
    return 'Expired';
  }

  return isInactive ? 'Inactive' : 'Active';
};

const normalizeTenant = (tenant: RawTenant, index: number): Tenant => {
  const subscription = tenant.subscription ?? tenant.currentSubscription ?? {};
  const id = getTenantId(tenant, index);
  const tenantId = getFirstString(tenant, ['tenantId', '_id'], id);
  const plan = getFirstString(subscription, ['planName', 'plan', 'name']) || getFirstString(tenant, ['planName', 'plan'], 'Unassigned');
  const isActive = tenant.isActive ?? tenant.active ?? tenant.enabled ?? subscription.isActive ?? true;
  const isInactive = typeof tenant.isInactive === 'boolean' ? tenant.isInactive : !Boolean(isActive);
  const expiry = formatDate(subscription.endDate ?? tenant.endDate ?? tenant.expiry ?? tenant.expiryDate);
  const planStatus = getFirstString(subscription, ['planStatus', 'status']) || getFirstString(tenant, ['planStatus', 'approvalStatus'], isInactive ? 'Inactive' : 'Approved');

  return {
    id,
    tenantId,
    name: getFirstString(tenant, ['name', 'tenantName', 'companyName', 'organizationName'], 'Unnamed Tenant'),
    code: getFirstString(tenant, ['code', 'tenantCode', 'shortCode'], '-'),
    email: getFirstString(tenant, ['email', 'primaryEmail', 'contactEmail', 'adminEmail'], '-'),
    plan,
    planStatus,
    expiry,
    isInactive,
    selected: Boolean(tenant.selected),
    statusTag: getStatusTag(tenant, expiry, isInactive),
  };
};

const extractTenants = (payload: unknown): RawTenant[] => {
  if (Array.isArray(payload)) {
    return payload as RawTenant[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const nested = record.data ?? record.items ?? record.value ?? record.tenants;

    if (Array.isArray(nested)) {
      return nested as RawTenant[];
    }
  }

  return [];
};

export async function getTenants(): Promise<Tenant[]> {
  const response = await get('tenants');
  return extractTenants(response).map(normalizeTenant);
}
