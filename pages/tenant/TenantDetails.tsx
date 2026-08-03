import React from 'react';
import { Settings, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Tenant } from './types';
import { TenantSettings } from './TenantSettings';

interface TenantDetailsProps {
  tenant: Tenant;
  activeView: 'approve' | 'settings';
  onViewChange: (view: 'approve' | 'settings') => void;
}

export const TenantDetails: React.FC<TenantDetailsProps> = ({ tenant, activeView, onViewChange }) => {
  const renderContent = () => {
    if (activeView === 'approve') {
      return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">Approve Tenant Access</p>
                <p className="mt-1 text-sm text-slate-500">Review this tenant before enabling platform access.</p>
              </div>
            </div>
            <Button variant="primary" size="md">
              Approve Tenant
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tenant</p>
              <p className="mt-2 font-semibold text-slate-900">{tenant.name}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Plan</p>
              <p className="mt-2 font-semibold text-slate-900">{tenant.plan}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-2 font-semibold text-slate-900">{tenant.planStatus}</p>
            </div>
          </div>
        </div>
      );
    }

    return <TenantSettings tenant={tenant} />;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-sm">
              {tenant.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Tenant Workspace</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{tenant.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Maintain tenant settings and approval status inline.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => onViewChange('settings')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeView === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              type="button"
              onClick={() => onViewChange('approve')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeView === 'approve' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck size={16} />
              Approve
            </button>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
