/**
 * Scan Service
 *
 * Provides API methods for managing scans.
 * Uses the centralised HTTP helpers from authService so every request
 * automatically carries the Bearer token and targets the correct base URL.
 */

import { get } from './authService';
import { BackendScan, BackendFileRecord } from '../types';

// ──────────────────────────── Scan API Methods ────────────────────────────

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


