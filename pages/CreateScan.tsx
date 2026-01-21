
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Database, 
  Settings, 
  Lock, 
  ShieldCheck, 
  Eye, 
  AlertCircle,
  Save,
  Rocket
} from 'lucide-react';
import { StorageSource } from '../types';

const steps = [
  { id: 1, title: 'Details', icon: Database },
  { id: 2, title: 'Configuration', icon: Settings },
  { id: 3, title: 'Credentials', icon: Lock },
  { id: 4, title: 'Actions', icon: ShieldCheck },
  { id: 5, title: 'Review', icon: Eye },
];

const CreateScan: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: StorageSource.GOOGLE_DRIVE,
    extensions: '.pdf, .docx, .csv',
    frequency: 'Weekly',
    action: 'Notify only',
    apiKey: '',
    secretKey: ''
  });

  useEffect(() => {
    if (id) {
      // Mock loading data for edit mode
      setFormData({
        name: id === '1' ? 'Q4 Customer Data Scan' : 'Finance Shared Drive Daily',
        location: id === '1' ? StorageSource.AWS_S3 : StorageSource.ONEDRIVE,
        extensions: '.csv, .json',
        frequency: id === '1' ? 'Weekly' : 'Daily',
        action: 'Quarantine',
        apiKey: '••••••••••••••••',
        secretKey: '••••••••••••••••'
      });
      // Skip to review step if editing? Usually better to start at 1, but we'll stick to 1.
    }
  }, [id]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Storage Location</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[StorageSource.GOOGLE_DRIVE, StorageSource.ONEDRIVE, StorageSource.AWS_S3].map(source => (
                  <button 
                    key={source}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                      formData.location === source 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                    onClick={() => setFormData({...formData, location: source})}
                  >
                    <Database size={24} className="mb-2" />
                    <span className="text-sm font-bold">{source}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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
                <p className="text-slate-700 font-medium">{formData.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Frequency</p>
                <p className="text-slate-700 font-medium">{formData.frequency}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Detection Action</p>
                <p className="text-slate-700 font-medium">{formData.action}</p>
              </div>
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
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -z-10 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(currentStep - 1) * 25}%` }}
          ></div>
          {steps.map(step => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 cursor-pointer ${
                  step.id < currentStep 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : step.id === currentStep 
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-xl' 
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
                onClick={() => id && setCurrentStep(step.id)}
              >
                {step.id < currentStep ? <Check size={20} /> : <step.icon size={20} />}
              </div>
              <span className={`text-[10px] font-bold uppercase mt-2 tracking-widest ${
                step.id === currentStep ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl min-h-[400px] flex flex-col">
        <div className="flex-1">
          {renderStep()}
        </div>

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
                onClick={() => {
                  alert('Scan configuration saved successfully.');
                  navigate('/scans');
                }}
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
                onClick={() => {
                  alert('Scan launched immediately!');
                  navigate('/scans');
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
