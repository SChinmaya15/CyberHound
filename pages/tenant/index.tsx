import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, SlidersHorizontal, ShieldCheck, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TenantDetails } from './TenantDetails';
import { CreateTenantModal } from './CreateTenantModal';
import { Tenant } from './types';
import { getTenants } from '../../services/tenantService';

export const TenantPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All Plans');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionView, setActionView] = useState<'insights' | 'settings' | 'approve'>('insights');
  const [rows, setRows] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTenants = async () => {
      setIsLoading(true);
      setError('');

      try {
        const tenants = await getTenants();
        if (isMounted) {
          setRows(tenants);
        }
      } catch (err: any) {
        if (isMounted) {
          setRows([]);
          setError(err?.message || 'Unable to load tenants.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTenants();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTenants = useMemo(() => {
    return rows.filter((tenant) => {
      const matchesSearch = [tenant.name, tenant.email, tenant.code].some((value) =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesPlan = selectedPlan === 'All Plans' || tenant.plan === selectedPlan;
      return matchesSearch && matchesPlan;
    });
  }, [rows, searchTerm, selectedPlan]);

  const planOptions = useMemo(() => {
    const plans = Array.from(new Set(rows.map((tenant) => tenant.plan).filter(Boolean))).sort();
    return ['All Plans', ...plans];
  }, [rows]);

  const visibleCount = filteredTenants.length;
  const activeCount = filteredTenants.filter((tenant) => !tenant.isInactive).length;
  const inactiveCount = filteredTenants.filter((tenant) => tenant.isInactive).length;

  const handleToggleInactive = (tenantId: string) => {
    setRows((current) =>
      current.map((tenant) =>
        tenant.id === tenantId ? { ...tenant, isInactive: !tenant.isInactive } : tenant
      )
    );
  };

  const toggleExpand = (tenantId: string) => {
    if (expandedId === tenantId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(tenantId);
    setActionView('insights');
  };

  const handleCreateTenant = (newTenant: Tenant) => {
    setRows([...rows, newTenant]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              <ShieldCheck size={16} className="text-indigo-600" />
              Tenant Administration
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>
              <p className="text-slate-500">Review tenants, approve access, and open insights or settings inline.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tenants by name or email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {planOptions.map((plan) => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
            <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Total Visible Tenants</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{visibleCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Active Tenants</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{activeCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Inactive Tenants</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{inactiveCount}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 p-10 text-sm font-semibold text-slate-500">
            <Loader2 size={18} className="animate-spin text-indigo-600" />
            Loading tenants
          </div>
        )}
        {!isLoading && error && (
          <div className="flex items-start gap-3 border-b border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
            <AlertCircle size={18} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div className="min-w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.12em] text-[11px]">
              <tr>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!isLoading && filteredTenants.map((tenant) => (
                <React.Fragment key={tenant.id}>
                  <tr className="group hover:bg-slate-50">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <SlidersHorizontal size={18} />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{tenant.name}</p>
                            {tenant.selected && (
                              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">Selected</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">ID: {tenant.tenantId} · Code: {tenant.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="text-sm font-semibold text-slate-900">{tenant.email}</p>
                      <p className="text-xs text-slate-400">Primary Email</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">{tenant.plan}</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tenant.planStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                          {tenant.planStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{tenant.expiry}</span>
                      </div>
                      <span className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">{tenant.statusTag}</span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                          <input
                            type="checkbox"
                            checked={tenant.isInactive}
                            onChange={() => handleToggleInactive(tenant.id)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          Inactive
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleExpand(tenant.id)}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          {expandedId === tenant.id ? 'Collapse' : 'Expand'}
                          {expandedId === tenant.id ? <ChevronUp className="ml-2" size={16} /> : <ChevronDown className="ml-2" size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === tenant.id && (
                    <tr>
                      <td colSpan={5} className="bg-slate-50 px-6 py-5">
                        <TenantDetails
                          tenant={tenant}
                          activeView={actionView}
                          onViewChange={setActionView}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!isLoading && filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTenant={handleCreateTenant}
      />
    </div>
  );
};

export default TenantPage;
