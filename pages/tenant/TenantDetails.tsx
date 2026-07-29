import React, { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Tenant } from './types';
import { TenantSettings } from './TenantSettings';

interface TenantDetailsProps {
  tenant: Tenant;
  activeView: 'approve' | 'insights' | 'settings';
  onViewChange: (view: 'approve' | 'insights' | 'settings') => void;
}

export const TenantDetails: React.FC<TenantDetailsProps> = ({ tenant, activeView, onViewChange }) => {
  const renderContent = () => {
    if (activeView === 'approve') {
      return (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <ShieldCheck size={22} className="text-indigo-600" />
            <div>
              <p className="text-lg font-semibold">Approve Tenant Access</p>
              <p className="text-sm text-slate-500">Review the tenant details and approve or reject access.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tenant</p>
              <p className="mt-2 font-semibold text-slate-900">{tenant.name}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Plan</p>
              <p className="mt-2 font-semibold text-slate-900">{tenant.plan}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-2 font-semibold text-slate-900">{tenant.planStatus}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" size="md" onClick={() => onViewChange('insights')}>
              Back to Insights
            </Button>
            <Button variant="primary" size="md">
              Approve Tenant
            </Button>
          </div>
        </div>
      );
    }

    if (activeView === 'settings') {
      return <TenantSettings tenant={tenant} />;
    }

    // Insights view
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Conversion Rate</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">0%</p>
            <p className="mt-2 text-xs text-slate-500">Room for improvement</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lead Value</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">₹0</p>
            <p className="mt-2 text-xs text-slate-500">Per converted lead</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Performance Overview</p>
              <p className="text-sm text-slate-500">Key metrics over the last 6 months</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-white px-3 py-2">Performance</span>
              <span className="rounded-full bg-white px-3 py-2">Conversion Funnel</span>
              <span className="rounded-full bg-white px-3 py-2">Lead Sources</span>
              <span className="rounded-full bg-white px-3 py-2">Campaign Analytics</span>
              <span className="rounded-full bg-white px-3 py-2">AI Cohorts</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Leads</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Bookings</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Conversion Rate</p>
                  <p className="mt-2 text-xl font-bold text-rose-600">0%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Value</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">₹0</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="h-56 rounded-3xl border border-slate-200 bg-slate-50"></div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Leads</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">Current User Performance</p>
              <p className="text-sm text-slate-500">No agent performance data available</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">3 Months</span>
          </div>
          <div className="h-32 rounded-3xl border border-slate-200 bg-slate-50" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-lg font-semibold text-slate-900">Top Performers</p>
          <p className="mt-2 text-sm text-slate-500">Best performing team members based on conversion rates</p>
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-400">
            No performance data available
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Tenant Actions</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Open tenant-specific insights or settings inline.</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={activeView === 'approve' ? 'secondary' : 'outline'} size="sm" onClick={() => onViewChange('approve')}>
              Approve
            </Button>
            <Button variant={activeView === 'insights' ? 'secondary' : 'outline'} size="sm" onClick={() => onViewChange('insights')}>
              Insights
            </Button>
            <Button variant={activeView === 'settings' ? 'primary' : 'outline'} size="sm" onClick={() => onViewChange('settings')}>
              Settings
            </Button>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
