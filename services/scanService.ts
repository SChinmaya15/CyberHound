/**
 * Scan Service
 *
 * Provides API methods for managing scans.
 * Uses the centralised HTTP helpers from authService so every request
 * automatically carries the Bearer token and targets the correct base URL.
 */

import { get, post } from './authService';
import { BackendScan, BackendFileRecord, LaunchScanRequest } from '../types';

// ──────────────────────────── Scan API Methods ────────────────────────────
const SCAN_ENDPOINTS = ['scan', 'Scan', 'Scans'] as const;

/**
 * Fetch the full list of scans from the API.
 *
 * GET  /api/Scan/GetScanList
 *
 * @returns A promise that resolves to the array of raw scan objects.
 *
 * @example
 * const scans = await getScanList();
 */
export async function getScanList(): Promise<BackendScan[]> {
  return get<BackendScan[]>('Scan/GetScanList');
}

/**
 * Fetch the scanned file records from the API.
 *
 * GET  /api/FileRecord
 *
 * @returns A promise that resolves to the array of raw file record objects.
 */
export async function getFileRecords(): Promise<BackendFileRecord[]> {
  return get<BackendFileRecord[]>('FileRecord');
}

/**
 * Run/launch a scan immediately by posting the full scan request body.
 *
 * POST /api/Scan/RunScan
 *
 * @param request The full launch scan payload.
 */
export async function runScan(request: LaunchScanRequest): Promise<any> {
  return post('scan', request);
}



