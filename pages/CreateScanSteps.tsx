import React from 'react';
import {
  Lock,
  AlertCircle,
} from 'lucide-react';
import { StorageSourceEnum } from '../enums';
import { AgentOption } from '../types';

interface FormData {
  name: string;
  location: number;
  selectedAgentIds: string[];
  extensions: string;
  networkTargets: string;
  networkMode: string;
  networkUsername: string;
  networkPassword: string;
  networkSshKey: string;
  physicalPath: string;
  physicalScanMode: string;
  physicalUsername: string;
  physicalPassword: string;
  frequency: string;
  action: string;
  apiKey: string;
  secretKey: string;
}

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  sourceTab?: 'Local' | 'Cloud';
  setSourceTab?: (tab: 'Local' | 'Cloud') => void;
  availableAgents?: AgentOption[];
  isLoadingAgents?: boolean;
  agentValidationError?: string | null;
  scanNameError?: string | null;
  toggleAgentSelection?: (agentId: string) => void;
  setScanNameError?: (error: string | null) => void;
  setAgentValidationError?: (error: string | null) => void;
  getStorageSourceIcon?: (source: number) => React.ComponentType<any>;
  getStorageSourceName?: (source: number) => string;
  requiresAgentSelection?: (location: number) => boolean;
  localSources?: Array<{ id: number; label: string }>;
  cloudSources?: Array<{ id: number; label: string }>;
}

export const ScanDetailsStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  sourceTab,
  setSourceTab,
  localSources,
  cloudSources,
  getStorageSourceIcon,
  scanNameError,
  setScanNameError,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Scan Name *</label>
        <input
          type="text"
          placeholder="e.g. Q4 Financial Records Scan"
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
            scanNameError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
          }`}
          value={formData.name}
          onChange={e => {
            setFormData({ ...formData, name: e.target.value });
            setScanNameError?.(null);
          }}
        />
        {scanNameError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {scanNameError}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Data Source</label>
        <div className="mb-4 flex rounded-xl bg-slate-100 p-1">
          {(['Local', 'Cloud'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setSourceTab?.(tab)}
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
          {(sourceTab === 'Local' ? localSources : cloudSources)?.map(source => {
            const SourceIcon = getStorageSourceIcon?.(source.id);
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
                {SourceIcon && <SourceIcon size={24} className="mb-2" />}
                <span className="text-sm font-bold">{source.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ScanConfigurationStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  availableAgents,
  isLoadingAgents,
  agentValidationError,
  toggleAgentSelection,
  setAgentValidationError,
  requiresAgentSelection,
}) => {
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
              onChange={e => setFormData({ ...formData, extensions: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-2">Comma separated values. Leave empty to scan all common document types.</p>
          </div>
        </>
      )}
      {requiresAgentSelection?.(formData.location) && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <label className="block text-sm font-semibold text-slate-700">Agents *</label>
            <p className="text-xs text-slate-400">Only active and available agents are listed.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {isLoadingAgents ? (
              <p className="px-2 py-3 text-sm text-slate-500">Loading available agents...</p>
            ) : availableAgents?.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">No active and available agents are currently available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {availableAgents?.map(agent => {
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
                        onChange={() => toggleAgentSelection?.(agent.id)}
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
              onClick={() => setFormData({ ...formData, frequency: freq as any })}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ScanCredentialsStep: React.FC<StepProps> = ({
  formData,
  setFormData,
}) => {
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
              onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Secret Key</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.secretKey}
              onChange={e => setFormData({ ...formData, secretKey: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
};

export const ScanActionsStep: React.FC<StepProps> = ({
  formData,
  setFormData,
}) => {
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
                onChange={() => setFormData({ ...formData, action: action as any })}
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
};

export const ScanReviewStep: React.FC<
  StepProps & {
    getStorageSourceName?: (source: number) => string;
  }
> = ({
  formData,
  getStorageSourceName,
  requiresAgentSelection,
}) => {
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
          <p className="text-slate-700 font-medium">{getStorageSourceName?.(formData.location)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Frequency</p>
          <p className="text-slate-700 font-medium">{formData.frequency}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Detection Action</p>
          <p className="text-slate-700 font-medium">{formData.action}</p>
        </div>
        {requiresAgentSelection?.(formData.location) && (
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
};
