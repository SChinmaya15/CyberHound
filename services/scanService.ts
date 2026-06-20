/**
 * Scan Service
 *
 * Provides API methods for managing scans.
 * Uses the centralised HTTP helpers from authService so every request
 * automatically carries the Bearer token and targets the correct base URL.
 */

import { get, post } from './authService';
import { BackendScan, BackendFileRecord, CreateScanRequest } from '../types';

// ──────────────────────────── Scan API Methods ────────────────────────────
/**
 * Fetch the full list of scans from the API.
 *
 * GET  /api/Scan/GetScans
 *
 * @returns A promise that resolves to the array of raw scan objects.
 *
 * @example
 * const scans = await getScanList();
 */
export async function getScanList(): Promise<BackendScan[]> {
  return get<BackendScan[]>('Scan/GetScans');
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
 * Save a scan configuration.
 *
 * POST /api/Scan/CreateScan
 *
 * @param request The create scan payload.
 */
export async function saveScan(request: CreateScanRequest): Promise<any> {
  return post('Scan/CreateScan', request);
}

/**
 * Run/launch a scan immediately.
 *
 * POST /api/Scan/RunScan
 *
 * @param scanId The scan identifier to run.
 */
export async function runScan(scanId: string): Promise<any> {
  return post('Scan/RunScan', { scanId });
}
