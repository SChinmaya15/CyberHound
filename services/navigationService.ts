import { get } from './authService';
import { toObjectIdHex } from './objectId';
import { BackendNavItem, NavItem } from '../types';

/**
 * The nav API currently sends a couple of paths that don't match this app's
 * actual routes (e.g. Dashboard as "/" instead of "/dashboard", which
 * collides with the Login route; Insights as "/insights" instead of the
 * real "/findings" route). Normalize them here so the sidebar doesn't send
 * users to an unmatched route, which falls through to the catch-all
 * redirect to "/" (Login) and looks like the app logged them out. Remove
 * each mapping once the backend sends the corrected path. Exported so it
 * can also be applied to the client-side fallback nav list, which should
 * resolve to the same real routes regardless of which path convention it's
 * written in.
 */
const PATH_CORRECTIONS: Record<string, string> = {
  '/': '/dashboard',
  '/insights': '/findings',
};

export const normalizePath = (path: string): string => PATH_CORRECTIONS[path] ?? path;

const mapNavItem = (item: BackendNavItem, index: number): NavItem => ({
  id: toObjectIdHex(item.id) || `nav-${index + 1}`,
  orderIndex: item.orderIndex,
  name: item.name,
  path: normalizePath(item.path),
  iconKey: item.iconKey,
  description: item.description ?? '',
});

export async function getNavigationMenu(userId: string): Promise<NavItem[]> {
  const items = await get<BackendNavItem[]>(`auth/navigations/${userId}`);
  return (items ?? [])
    .map(mapNavItem)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}
