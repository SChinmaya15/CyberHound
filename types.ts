
export enum PIILevel {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum ScanStatus {
  COMPLETED = 'Completed',
  IN_PROGRESS = 'In Progress',
  PENDING = 'Pending',
  FAILED = 'Failed',
  DRAFT = 'Draft'
}

export enum StorageSource {
  GOOGLE_DRIVE = 0,
  DROPBOX= 1,
  ONEDRIVE= 2,
  AWS_S3 = 3
}

export interface Scan {
  id: string;
  name: string;
  location: StorageSource;
  frequency: 'One-time' | 'Daily' | 'Weekly' | 'Monthly';
  status: ScanStatus;
  lastRun: string;
}

export interface PIIDetected {
  id: string;
  type: string;
  count: number;
  severity: PIILevel;
  status: 'Detected' | 'In-Progress' | 'Resolved';
  lastSeen: string;
}

export interface ScannedFile {
  id: string;
  name: string;
  source: StorageSource;
  date: string;
  piiFound: boolean;
  piiCount: number;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator' | 'Viewer';
  status: 'Active' | 'Inactive';
}

export interface ScanConfig {
  name: string;
  location: StorageSource;
  fileExtensions: string[];
  frequency: 'One-time' | 'Daily' | 'Weekly' | 'Monthly';
  action: 'Notify only' | 'Quarantine' | 'Auto-resolve' | 'None';
}

export interface CreateScanRequest {
  id: string;
  name: string;
  location: number;
  extensions: string[];
  frequency: number;
  action: number;
  apiKey: string;
  secretKey: string;
  networkTargets?: string;
  networkMode?: string;
  networkUsername?: string;
  networkPassword?: string;
  networkSshKey?: string;
  physicalPath?: string;
  physicalScanMode?: string;
  physicalUsername?: string;
  physicalPassword?: string;
}

export interface BackendScanId {
  timestamp: number;
  machine: number;
  pid: number;
  increment: number;
  creationTime: string;
}

export interface BackendScan {
  id: BackendScanId;
  name: string;
  status: string | null;
  location: number;
  frequency: number;
  action: number;
  extensions: string[];
  apiKey: string;
  secretKey: string;
  lastRun: string | null;
}

export interface BackendFileRecordId {
  timestamp: number;
  machine: number;
  pid: number;
  increment: number;
  creationTime: string;
}

export interface BackendFileRecord {
  hasPii: boolean;
  path: string;
  fileName: string;
  source: string | null;
  lastScanned: string;
  piiTypes: string[];
  id: BackendFileRecordId;
}


