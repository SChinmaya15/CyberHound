
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
  Save,
  Rocket
} from 'lucide-react';
import { AgentOption, CreateScanRequest, LaunchScanRequest } from '../types';
import { apiClient } from '../api/client';
import { ActionType, Frequency, StorageSourceEnum } from '../enums';
import { getAvailableAgents } from '../services/agentService';
import { runScan } from '../services/scanService';
import { Modal } from '../components/ui/Modal';

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
    case StorageSourceEnum.PHYSICAL: return 'LocalFolder';
    case StorageSourceEnum.NETWORK: return 'Network';
    case StorageSourceEnum.GOOGLE_DRIVE: return 'GoogleDrive';
    case StorageSourceEnum.DROPBOX: return 'Dropbox';
    case StorageSourceEnum.AZURE_BLOB: return 'AzureBlob';
    case StorageSourceEnum.AWS_S3: return 'AWSS3';
    case StorageSourceEnum.ONEDRIVE: return 'OneDrive';
    default: return 'LocalFolder';
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
  { id: StorageSourceEnum.NETWORK, label: 'Network' },
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
    extensions: '.pdf, .docx, .csv',
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
      const request: CreateScanRequest = {
        id: '',
        name: formData.name,
        location: formData.location,
        extensions: formData.location === StorageSourceEnum.NETWORK ? [formData.networkTargets] : formData.extensions.split(","),
        frequency: formData.frequency,
        action: formData.action,
        apiKey: formData.apiKey,
        secretKey: formData.secretKey,
        networkTargets: formData.location === StorageSourceEnum.NETWORK ? formData.networkTargets : undefined,
        networkMode: formData.location === StorageSourceEnum.NETWORK ? formData.networkMode : undefined,
        networkUsername: formData.location === StorageSourceEnum.NETWORK ? formData.networkUsername : undefined,
        networkPassword: formData.location === StorageSourceEnum.NETWORK ? formData.networkPassword : undefined,
        networkSshKey: formData.location === StorageSourceEnum.NETWORK ? formData.networkSshKey : undefined,
        physicalPath: formData.location === StorageSourceEnum.PHYSICAL ? formData.physicalPath : undefined,
        physicalScanMode: formData.location === StorageSourceEnum.PHYSICAL ? formData.physicalScanMode : undefined,
        physicalUsername: formData.location === StorageSourceEnum.PHYSICAL ? formData.physicalUsername : undefined,
        physicalPassword: formData.location === StorageSourceEnum.PHYSICAL ? formData.physicalPassword : undefined,
      };

      await apiClient.post('scan', request);
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Scan Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Q4 Financial Records Scan"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data Source</label>
              <div className="mb-4 flex rounded-xl bg-slate-100 p-1">
              {(['Local', 'Cloud'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchSourceTab(tab)}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    sourceTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(sourceTab === 'Local' ? localSources : cloudSources).map(source => {
                const SourceIcon = getStorageSourceIcon(source.id);
                return (
                  <button
                    key={source.id}
                    type="button"
                    className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                      formData.location === source.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                    onClick={() => setFormData({ ...formData, location: source.id })}
                  >
                    <SourceIcon size={24} className="mb-2" />
                    <span className="text-sm font-bold">{source.label}</span>
                  </button>
                );
              })}
            </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {formData.location === StorageSourceEnum.NETWORK ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Network Target Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 10.0.0.0/24, 192.168.1.0/24"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.networkTargets}
                    onChange={e => setFormData({ ...formData, networkTargets: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-2">Enter one or more CIDR ranges or host IPs for the network scan.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Network Scan Mode</label>
                  <div className="flex flex-wrap gap-2">
                    {['Active', 'Passive', 'Hybrid'].map(mode => (
                      <button
                        key={mode}
                        className={`px-6 py-2 rounded-full border transition-all ${
                          formData.networkMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                        onClick={() => setFormData({ ...formData, networkMode: mode as any })}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Active probes scan hosts directly; passive mode analyzes network traffic.</p>
                </div>
              </>
            ) : formData.location === StorageSourceEnum.PHYSICAL ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Physical Device Path</label>
                  <input
                    type="text"
                    placeholder="e.g. E:\\, /mnt/usb, \\SERVER\\SHARE"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.physicalPath}
                    onChange={e => setFormData({ ...formData, physicalPath: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-2">Provide the local mount path or device share to scan.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Scan Mode</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mounted Volume', 'Removable Media', 'Local Folder'].map(mode => (
                      <button
                        key={mode}
                        className={`px-6 py-2 rounded-full border transition-all ${
                          formData.physicalScanMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                        onClick={() => setFormData({ ...formData, physicalScanMode: mode as any })}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Choose the scan style for the attached physical source.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">File Extensions to Include</label>
                  <input
                    type="text"
                    placeholder=".pdf, .docx, .xlsx, .json"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.extensions}
                    onChange={e => setFormData({ ...formData, extensions: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-2">Comma separated values. Leave empty to scan all common document types.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">File Extensions to Include</label>
                  <input 
                    type="text" 
                    placeholder=".pdf, .docx, .xlsx, .json"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.extensions}
                    onChange={e => setFormData({...formData, extensions: e.target.value})}
                  />
                  <p className="text-xs text-slate-400 mt-2">Comma separated values. Leave empty to scan all common document types.</p>
                </div>
              </>
            )}
            {requiresAgentSelection(formData.location) && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Agents *</label>
                  <p className="text-xs text-slate-400">Only active and available agents are listed.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {isLoadingAgents ? (
                    <p className="px-2 py-3 text-sm text-slate-500">Loading available agents...</p>
                  ) : availableAgents.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-slate-500">No active and available agents are currently available.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {availableAgents.map(agent => {
                        const isSelected = formData.selectedAgentIds.includes(agent.id);

                        return (
                          <label
                            key={agent.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-white shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAgentSelection(agent.id)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                              <p className="text-xs text-slate-500">ID: {agent.id}</p>
                              <p className="text-xs text-emerald-600">{agent.status}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {agentValidationError && (
                  <p className="mt-2 text-sm text-rose-600">{agentValidationError}</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Scan Frequency</label>
              <div className="flex flex-wrap gap-2">
                {['One-time', 'Daily', 'Weekly', 'Monthly'].map(freq => (
                  <button 
                    key={freq}
                    className={`px-6 py-2 rounded-full border transition-all ${
                      formData.frequency === freq ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                    onClick={() => setFormData({...formData, frequency: freq as any})}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-start space-x-3">
              <Lock className="text-sky-600 mt-1" size={20} />
              <div>
                <p className="text-sm font-bold text-sky-800">Bank-Grade Encryption</p>
                <p className="text-xs text-sky-600">Your credentials are encrypted with AES-256 before being stored in our secure vault.</p>
              </div>
            </div>
            {formData.location === StorageSourceEnum.NETWORK ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Network Admin Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.networkUsername}
                    onChange={e => setFormData({ ...formData, networkUsername: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Network Admin Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.networkPassword}
                    onChange={e => setFormData({ ...formData, networkPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">SSH Key (optional)</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.networkSshKey}
                    onChange={e => setFormData({ ...formData, networkSshKey: e.target.value })}
                    placeholder="Paste your SSH key for remote host authentication"
                  />
                </div>
              </>
            ) : formData.location === StorageSourceEnum.PHYSICAL ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Local Access Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.physicalUsername}
                    onChange={e => setFormData({ ...formData, physicalUsername: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Local Access Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.physicalPassword}
                    onChange={e => setFormData({ ...formData, physicalPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Access Method</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.physicalScanMode}
                    onChange={e => setFormData({ ...formData, physicalScanMode: e.target.value })}
                  >
                    <option>Mounted Volume</option>
                    <option>Removable Media</option>
                    <option>Local Folder</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Access Key / Client ID</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.apiKey}
                    onChange={e => setFormData({...formData, apiKey: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Secret Key</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.secretKey}
                    onChange={e => setFormData({...formData, secretKey: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">Actions on Threat Detection</label>
              <div className="space-y-3">
                {['Notify only', 'Quarantine', 'Auto-resolve', 'None'].map(action => (
                  <label key={action} className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="radio" 
                      name="action"
                      checked={formData.action === action}
                      onChange={() => setFormData({...formData, action: action as any})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{action}</p>
                      <p className="text-xs text-slate-400">
                        {action === 'Notify only' && 'Send alert email to admin on detection.'}
                        {action === 'Quarantine' && 'Move file to a restricted secure folder.'}
                        {action === 'Auto-resolve' && 'Attempt to mask PII automatically.'}
                        {action === 'None' && 'No automated action, logs only.'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h4 className="text-lg font-bold text-slate-800 border-b pb-2">Scan Summary</h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Scan Name</p>
                <p className="text-slate-700 font-medium">{formData.name || 'Untitled Scan'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Location</p>
                <p className="text-slate-700 font-medium">{getStorageSourceName(formData.location)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Frequency</p>
                <p className="text-slate-700 font-medium">{formData.frequency}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Detection Action</p>
                <p className="text-slate-700 font-medium">{formData.action}</p>
              </div>
              {requiresAgentSelection(formData.location) && (
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Agents</p>
                  <p className="text-slate-700 font-medium">
                    {formData.selectedAgentIds.length > 0
                      ? `${formData.selectedAgentIds.length} selected`
                      : 'None selected'}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 bg-amber-50 rounded-xl flex items-center space-x-3 border border-amber-100">
              <AlertCircle className="text-amber-600" size={20} />
              <p className="text-sm text-amber-700">Estimated runtime for initial scan is <span className="font-bold">12-15 minutes</span> based on your current storage volume.</p>
            </div>
          </div>
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
                <span>Save Configuration</span>
              </button>
            )}

            {currentStep < 5 ? (
              <button 
                onClick={nextStep}
                className="flex items-center space-x-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <span>Continue</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                className="flex items-center space-x-2 px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
                onClick={async () => {
                  const isPhysical = formData.location === StorageSourceEnum.PHYSICAL;
                  const isNetwork = formData.location === StorageSourceEnum.NETWORK;
                  if (!validateAgentSelection(2)) {
                    return;
                  }

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
                    .map(e => e.trim())
                    .filter(Boolean);

                  const frequencyStr = typeof formData.frequency === 'number'
                    ? (['Daily', 'Weekly', 'Monthly'] as const)[formData.frequency] ?? 'One-time'
                    : (formData.frequency as string);

                  const request: LaunchScanRequest = {
                    scanName: formData.name,
                    agents: selectedAgents,
                    agentIds: selectedAgents.map(agentId => ({
                      agentId,
                      status: 'Scheduled',
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
                  };

                  try {
                    await runScan(request);
                    setModalState({
                      title: 'Scan launched',
                      message: 'Scan launched successfully!',
                      confirmLabel: 'View scans',
                      onConfirm: () => navigate('/scans'),
                    });
                  } catch (err) {
                    console.error('Failed to launch scan:', err);
                    setModalState({
                      title: 'Launch failed',
                      message: 'Failed to launch scan. Please try again.',
                      confirmLabel: 'OK',
                      variant: 'danger',
                    });
                  }
                }}
              >
                <Rocket size={20} className="group-hover:-translate-y-1 transition-transform" />
                <span>Launch Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateScan;
