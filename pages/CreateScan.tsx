
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FileText,
  SlidersHorizontal,
  Key,
  Database, 
  Box,
  Cloud,
  HardDrive,
  Server,
  Settings, 
  Lock, 
  ShieldCheck, 
  Eye, 
  AlertCircle,
  Save
} from 'lucide-react';
import { AgentOption, CreateScanRequest, ScanStatus } from '../types';
import { ActionType, Frequency, StorageSourceEnum } from '../enums';
import { getAvailableAgents } from '../services/agentService';
import { saveScan } from '../services/scanService';
import { Modal } from '../components/ui/Modal';
import {
  ScanDetailsStep,
  ScanConfigurationStep,
  ScanCredentialsStep,
  ScanActionsStep,
  ScanReviewStep
} from './CreateScanSteps';

const steps = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Configuration', icon: SlidersHorizontal },
  { id: 3, title: 'Credentials', icon: Key },
  { id: 4, title: 'Actions', icon: ShieldCheck },
  { id: 5, title: 'Review', icon: Eye },
];

const getStorageSourceName = (source: number): string => {
  switch (source) {
    case StorageSourceEnum.GOOGLE_DRIVE:
      return 'Google Drive';
    case StorageSourceEnum.DROPBOX:
      return 'Dropbox';
    case StorageSourceEnum.AZURE_BLOB:
      return 'Azure Blob';
    case StorageSourceEnum.AWS_S3:
      return 'AWS S3 Bucket';
    case StorageSourceEnum.NETWORK:
      return 'Network';
    case StorageSourceEnum.ONEDRIVE:
      return 'OneDrive';
    case StorageSourceEnum.PHYSICAL:
      return 'Physical';
    default:
      return 'Google Drive';
  }
};

const getStorageSourceIcon = (source: number) => {
  switch (source) {
    case StorageSourceEnum.GOOGLE_DRIVE:
      return Cloud;
    case StorageSourceEnum.DROPBOX:
      return Box;
    case StorageSourceEnum.AZURE_BLOB:
      return Database;
    case StorageSourceEnum.AWS_S3:
      return HardDrive;
    case StorageSourceEnum.NETWORK:
      return Server;
    case StorageSourceEnum.ONEDRIVE:
      return Cloud;
    case StorageSourceEnum.PHYSICAL:
      return HardDrive;
    default:
      return Database;
  }
};

const getScanType = (location: number): string => {
  switch (location) {
    case StorageSourceEnum.PHYSICAL: return 'Local';
    case StorageSourceEnum.NETWORK: return 'Network';
    case StorageSourceEnum.AWS_S3: return 'AWSS3';
    case StorageSourceEnum.DROPBOX: return 'Dropbox';
    case StorageSourceEnum.ONEDRIVE: return 'OneDrive';
    case StorageSourceEnum.AZURE_BLOB: return 'AzureBlob';
    case StorageSourceEnum.GOOGLE_DRIVE: return 'GoogleDrive';
    default: return 'Local';
  }
};

const mapActionType = (action: string): string => {
  switch (action) {
    case 'Notify only': return 'NotifyOnly';
    case 'Quarantine': return 'Quarantine';
    case 'Auto-resolve': return 'AutoResolve';
    default: return 'None';
  }
};

const localSources = [
  { id: StorageSourceEnum.PHYSICAL, label: 'Physical' },
  // { id: StorageSourceEnum.NETWORK, label: 'Network' },
];

const cloudSources = [
  { id: StorageSourceEnum.GOOGLE_DRIVE, label: 'Google Drive' },
  { id: StorageSourceEnum.DROPBOX, label: 'Dropbox' },
  { id: StorageSourceEnum.AZURE_BLOB, label: 'Azure Blob' },
  { id: StorageSourceEnum.AWS_S3, label: 'AWS S3' },
  { id: StorageSourceEnum.ONEDRIVE, label: 'OneDrive' },
];

const requiresAgentSelection = (location: number) =>
  location === StorageSourceEnum.PHYSICAL || location === StorageSourceEnum.NETWORK;

const CreateScan: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [modalState, setModalState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    variant?: 'default' | 'danger';
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: StorageSourceEnum.GOOGLE_DRIVE,
    selectedAgentIds: [] as string[],
    extensions: '.pdf, .docx, .csv, .txt',
    networkTargets: '10.0.0.0/24',
    networkMode: 'Active',
    networkUsername: 'admin',
    networkPassword: '',
    networkSshKey: '',
    physicalPath: 'E:\\',
    physicalScanMode: 'Mounted Volume',
    physicalUsername: 'local-admin',
    physicalPassword: '',
    frequency: Frequency.Weekly,
    action: ActionType.NotifyOnly,
    apiKey: '',
    secretKey: ''
  });
  const [sourceTab, setSourceTab] = useState<'Local' | 'Cloud'>('Local');
  const [availableAgents, setAvailableAgents] = useState<AgentOption[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentValidationError, setAgentValidationError] = useState<string | null>(null);
  const [scanNameError, setScanNameError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingAgents(true);
    getAvailableAgents()
      .then((agents) => {
        if (isMounted) {
          setAvailableAgents(agents);
        }
      })
      .catch((error) => {
        console.error('Failed to load agents:', error);
        if (isMounted) {
          setAvailableAgents([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAgents(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!requiresAgentSelection(formData.location) && agentValidationError) {
      setAgentValidationError(null);
    }
  }, [agentValidationError, formData.location]);

  const switchSourceTab = (tab: 'Local' | 'Cloud') => {
    setSourceTab(tab);
    const activeSources = tab === 'Local' ? localSources : cloudSources;
    if (!activeSources.some(source => source.id === formData.location)) {
      setFormData({ ...formData, location: activeSources[0].id });
    }
  };

  useEffect(() => {
    if (id) {
      // Mock loading data for edit mode
      setFormData(prev => ({
        ...prev,
        name: id === '1' ? 'Q4 Customer Data Scan' : 'Finance Shared Drive Daily',
        location: id === '1' ? StorageSourceEnum.AWS_S3 : StorageSourceEnum.GOOGLE_DRIVE,
        extensions: '.csv, .json',
        frequency: id === '1' ? 'Weekly' : 'Daily',
        action: 'Quarantine',
        apiKey: '••••••••••••••••',
        secretKey: '••••••••••••••••'
      }));
      // Skip to review step if editing? Usually better to start at 1, but we'll stick to 1.
    }
  }, [id]);

  const validateScanName = (): boolean => {
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setScanNameError('Scan name is required.');
      return false;
    }

    if (trimmedName.length < 3) {
      setScanNameError('Scan name must be at least 3 characters long.');
      return false;
    }

    if (trimmedName.length > 100) {
      setScanNameError('Scan name must not exceed 100 characters.');
      return false;
    }

    if (!/^[a-zA-Z0-9\s._-]+$/.test(trimmedName)) {
      setScanNameError('Scan name can only contain letters, numbers, spaces, dots, hyphens, and underscores.');
      return false;
    }

    setScanNameError(null);
    return true;
  };

  const validateAgentSelection = (targetStep = 2): boolean => {
    if (!requiresAgentSelection(formData.location)) {
      setAgentValidationError(null);
      return true;
    }

    if (formData.selectedAgentIds.length > 0) {
      setAgentValidationError(null);
      return true;
    }

    setAgentValidationError('Please select at least one agent before submitting the scan request.');
    setCurrentStep(targetStep);
    return false;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateScanName()) {
      return;
    }

    if (currentStep === 2 && !validateAgentSelection(2)) {
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const toggleAgentSelection = (agentId: string) => {
    setFormData(prev => {
      const alreadySelected = prev.selectedAgentIds.includes(agentId);

      return {
        ...prev,
        selectedAgentIds: alreadySelected
          ? prev.selectedAgentIds.filter(id => id !== agentId)
          : [...prev.selectedAgentIds, agentId],
      };
    });
    setAgentValidationError(null);
  };

  const handleSaveConfiguration = async () => {
    if (!validateAgentSelection(2)) {
      return;
    }

    try {
      const isPhysical = formData.location === StorageSourceEnum.PHYSICAL;
      const isNetwork = formData.location === StorageSourceEnum.NETWORK;

      const selectedAgents = requiresAgentSelection(formData.location)
        ? formData.selectedAgentIds
        : [];

      const sourcePath = isPhysical
        ? formData.physicalPath
        : isNetwork
          ? formData.networkTargets
          : '';

      const sourceScanMode = isPhysical
        ? formData.physicalScanMode
        : isNetwork
          ? formData.networkMode
          : '';

      const sourceUsername = isPhysical
        ? formData.physicalUsername
        : isNetwork
          ? formData.networkUsername
          : '';

      const sourcePassword = isPhysical
        ? formData.physicalPassword
        : isNetwork
          ? formData.networkPassword
          : '';

      const extensions = formData.extensions
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      const frequencyStr = typeof formData.frequency === 'number'
        ? (['Daily', 'Weekly', 'Monthly'] as const)[formData.frequency] ?? 'One-time'
        : (formData.frequency as string);

      const request: CreateScanRequest = {
        scan: {
          name: formData.name,
          status: ScanStatus.IDLE,
          agents: selectedAgents.map((agentId) => ({
            agentId,
            status: ScanStatus.IDLE,
          })),
          scanType: getScanType(formData.location),
          source: {
            location: formData.location,
            path: sourcePath,
            scanMode: sourceScanMode,
            credentials: {
              username: sourceUsername,
              passwordEncrypted: sourcePassword,
            },
          },
          filters: {
            extensions,
            includeSubDirectories: true,
            maxFileSizeMB: 100,
          },
          schedule: {
            frequency: frequencyStr,
            nextRun: null,
          },
          actions: {
            type: mapActionType(formData.action as string),
            quarantinePath: null,
            remediationEnabled: false,
          },
          detection: {
            scanForPII: true,
            entities: ['Aadhaar', 'PAN', 'PhoneNumber', 'Email', 'BankAccount'],
          },
          cloudCredentials: {
            apiKey: formData.apiKey,
            secretKey: formData.secretKey,
          },
          execution: {
            overwriteExistingResults: true,
            stopPreviousScan: true,
            parallelThreads: 4,
            retryCount: 3,
            logLevel: 'Information',
          },
        },
        isLaunched: false,
      };

      await saveScan(request);
      setModalState({
        title: 'Scan configured',
        message: 'Scan configuration saved successfully.',
        confirmLabel: 'Go to scans',
        onConfirm: () => navigate('/scans'),
      });
    } catch (error) {
      console.error('Failed to save scan configuration:', error);
      setModalState({
        title: 'Save failed',
        message: 'Failed to save scan configuration. Please try again.',
        confirmLabel: 'OK',
        variant: 'danger',
      });
    }
  };

  const renderStep = () =>{
    switch (currentStep) {
      case 1:
        return (
          <ScanDetailsStep
            formData={formData}
            setFormData={setFormData}
            sourceTab={sourceTab}
            setSourceTab={switchSourceTab}
            scanNameError={scanNameError}
            setScanNameError={setScanNameError}
            getStorageSourceIcon={getStorageSourceIcon}
            localSources={localSources}
            cloudSources={cloudSources}
          />
        );
      case 2:
        return (
          <ScanConfigurationStep
            formData={formData}
            setFormData={setFormData}
            availableAgents={availableAgents}
            isLoadingAgents={isLoadingAgents}
            agentValidationError={agentValidationError}
            toggleAgentSelection={toggleAgentSelection}
            setAgentValidationError={setAgentValidationError}
            requiresAgentSelection={requiresAgentSelection}
          />
        );
      case 3:
        return (
          <ScanCredentialsStep
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <ScanActionsStep
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 5:
        return (
          <ScanReviewStep
            formData={formData}
            getStorageSourceName={getStorageSourceName}
            requiresAgentSelection={requiresAgentSelection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-800">{id ? 'Edit Scan Configuration' : 'Configure New Scan'}</h2>
        <p className="text-slate-500 mt-2">Target your data sources and set compliance parameters</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-200 -z-10"></div>
          <div 
            className="absolute inset-y-1/2 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          <div className="relative grid grid-cols-5 gap-4">
            {steps.map(step => (
              <button
                key={step.id}
                type="button"
                onClick={() => id && setCurrentStep(step.id)}
                className="flex flex-col items-center text-center"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  step.id < currentStep 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : step.id === currentStep 
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-xl' 
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step.id < currentStep ? <Check size={18} /> : <step.icon size={18} />}
                </span>
                <span className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  step.id === currentStep ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl min-h-[400px] flex flex-col">
        <div className="flex-1">
          {renderStep()}
        </div>

        <Modal
          open={!!modalState}
          title={modalState?.title ?? ''}
          message={modalState?.message ?? ''}
          confirmLabel={modalState?.confirmLabel}
          cancelLabel={modalState?.cancelLabel}
          onConfirm={modalState?.onConfirm ?? (() => setModalState(null))}
          onClose={() => setModalState(null)}
          variant={modalState?.variant}
        />

        <div className="flex justify-between mt-10 pt-8 border-t border-slate-100">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex space-x-3">
            {currentStep === 5 && (
              <button 
                className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
                onClick={handleSaveConfiguration}
              >
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                <span>Save Scan Configuration</span>
              </button>
            )}

            {currentStep < 5 && (
              <button 
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <span>Continue</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateScan;
