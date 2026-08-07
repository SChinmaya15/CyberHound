import { get, post } from './authService';
import { toObjectIdHex } from './objectId';
import { BackendUser, CreateUserRequest, CreateUserResponse, TeamMember } from '../types';

const EMPTY_DATE_PREFIX = '0001-01-01';

const humanizeRole = (role: string): string => {
  if (!role) {
    return 'User';
  }

  return role.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
};

const getUserId = (user: BackendUser, index: number): string => {
  return toObjectIdHex(user.id) || `user-${index + 1}`;
};

const mapUser = (user: BackendUser, index: number): TeamMember => {
  const displayName = user.displayName?.trim();
  const username = user.username?.trim() ?? '';
  const lastLoginAt = user.lastLoginAt && !user.lastLoginAt.startsWith(EMPTY_DATE_PREFIX)
    ? user.lastLoginAt
    : null;

  return {
    id: getUserId(user, index),
    tenantId: toObjectIdHex(user.tenantId),
    name: displayName || username || user.email || 'Unknown User',
    email: user.email ?? '',
    username,
    role: humanizeRole(user.role),
    lastLoginAt,
  };
};

export async function getUsers(): Promise<TeamMember[]> {
  const users = await get<BackendUser[]>('users');
  return (users ?? []).map(mapUser);
}

export async function getUsersByTenant(tenantId: string): Promise<TeamMember[]> {
  const users = await get<BackendUser[]>(`tenants/${tenantId}/users`);
  return (users ?? []).map(mapUser);
}

export async function createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
  return post<CreateUserResponse>('users', request);
}
