import { del, get, patch, post } from './authService';
import {
  CreateSubscriptionRequest,
  Subscription,
  UpdateSubscriptionRequest,
} from '../types';

export async function getSubscriptionByTenant(tenantId: string): Promise<Subscription> {
  return get<Subscription>(`subscription/tenant/${tenantId}`);
}

export async function createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
  return post<Subscription>('subscription', request);
}

export async function updateSubscription(
  tenantId: string,
  request: UpdateSubscriptionRequest,
): Promise<Subscription> {
  return patch<Subscription>(`subscription/tenant/${tenantId}`, request);
}

export async function deleteSubscription(tenantId: string): Promise<void> {
  await del<void>(`subscription/tenant/${tenantId}`);
}
