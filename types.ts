
export enum PIILevel {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum ScanStatus {
  DRAFT = 'Draft',
  FAILED = 'Failed',
  RUNNING = 'Running',
  PENDING = 'Pending',
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
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

export interface LaunchScanAgentAssignment {
  agentId: string;
  status: ScanStatus;
}

export interface AgentOption {
  id: string;
  name: string;
  isActive: boolean;
  status: ScanStatus;
  isAvailable: boolean;
}

export interface ScanConfiguration {
  name: string;
  status: ScanStatus;
  agents: LaunchScanAgentAssignment[];
  scanType: string;
  source: {
    location: number;
    path: string;
    scanMode: string;
    credentials: {
      username: string;
      passwordEncrypted: string;
    };
  };
  filters: {
    extensions: string[];
    includeSubDirectories: boolean;
    maxFileSizeMB: number;
  };
  schedule: {
    frequency: string;
    nextRun: string | null;
  };
  actions: {
    type: string;
    quarantinePath: string | null;
    remediationEnabled: boolean;
  };
  detection: {
    scanForPII: boolean;
    entities: string[];
  };
  cloudCredentials: {
    apiKey: string;
    secretKey: string;
  };
  execution: {
    overwriteExistingResults: boolean;
    stopPreviousScan: boolean;
    parallelThreads: number;
    retryCount: number;
    logLevel: string;
  };
}

export interface CreateScanRequest {
  isLaunched: boolean;
  scan: ScanConfiguration;
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


