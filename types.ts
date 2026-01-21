
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
  GOOGLE_DRIVE = 'Google Drive',
  ONEDRIVE = 'OneDrive',
  AWS_S3 = 'AWS S3 Bucket'
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
