
export enum PIILevel {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum ScanStatus {
  IDLE = 'Idle',
  FAILED = 'Failed',
  RUNNING = 'Running',
  PENDING = 'Pending',
  QUEUED = 'Queued',
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
  role: 'Super-Admin' | 'Admin' | 'Operator' | 'Viewer' | string;
  status: 'Active' | 'Inactive';
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  userName: string;
  lastName: string;
  password: string;
  firstName: string;
}

export interface CreateUserResponse {
  id?: string;
  tenantId?: string;
  email?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface BackendObjectId {
  timestamp: number;
  machine: number;
  pid: number;
  increment: number;
  creationTime: string;
}

export interface BackendUserTenant {
  id: BackendObjectId;
  isActive: boolean;
  isDeleted: boolean;
  name: string;
  code: string;
  email: string;
}

export interface BackendUser {
  role: string;
  id: BackendObjectId;
  tenantId: BackendObjectId;
  lastLoginAt: string;
  email: string;
  tenant: BackendUserTenant;
  username: string;
  displayName: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  lastLoginAt: string | null;
}

export type SubscriptionModel = 'UserBased' | 'PayPerUse' | 'PayPerScan' | 'OneTimeCharge';

export interface CreateSubscriptionRequest {
  tenantId: string;
  model: SubscriptionModel;
  startDate?: string | null;
  endDate?: string | null;
  planName?: string;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  isActive?: boolean | null;
  planName?: string | null;
  endDate?: string | null;
  startDate?: string | null;
  model?: SubscriptionModel | null;
}

export interface Subscription {
  id?: string;
  subscriptionId?: string;
  tenantId: string;
  model: SubscriptionModel;
  isActive?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  planName?: string | null;
  createdAt?: string;
  updatedAt?: string;
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


