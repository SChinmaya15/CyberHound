import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, ShieldCheck, Plus, Loader2, AlertCircle, Building2, Activity, PauseCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TenantDetails } from './TenantDetails';
import { CreateTenantModal } from './CreateTenantModal';
import { Tenant } from './types';
import { getTenants } from '../../services/tenantService';

const AVATAR_PALETTE = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const getAvatarGradient = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const StatCard: React.FC<{ title: string; value: number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => (
  <Card className="p-6 transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`rounded-2xl p-3 text-white ${color}`}>
        <Icon size={22} />
      </div>
    </div>
  </Card>
);

export const TenantPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All Plans');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionView, setActionView] = useState<'settings' | 'approve'>('settings');
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
    setActionView('settings');
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
              <p className="text-slate-500">Review tenants, approve access, and manage settings inline.</p>
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
        <StatCard title="Total Visible Tenants" value={visibleCount} icon={Building2} color="bg-indigo-600" />
        <StatCard title="Active Tenants" value={activeCount} icon={Activity} color="bg-emerald-500" />
        <StatCard title="Inactive Tenants" value={inactiveCount} icon={PauseCircle} color="bg-slate-400" />
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!isLoading && filteredTenants.map((tenant) => (
                <React.Fragment key={tenant.id}>
                  <tr className={`group transition-colors hover:bg-slate-50 ${expandedId === tenant.id ? 'bg-indigo-50/40' : ''}`}>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-sm ${getAvatarGradient(tenant.name)}`}>
                          {getInitials(tenant.name)}
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
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!tenant.isInactive}
                          onClick={() => handleToggleInactive(tenant.id)}
                          title={tenant.isInactive ? 'Inactive — click to activate' : 'Active — click to deactivate'}
                          className="inline-flex shrink-0 items-center"
                        >
                          <span className={`relative h-5 w-9 rounded-full transition-colors ${tenant.isInactive ? 'bg-slate-300' : 'bg-emerald-500'}`}>
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                                tenant.isInactive ? 'left-0.5' : 'left-4'
                              }`}
                            />
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(tenant.id)}
                          title={expandedId === tenant.id ? 'Collapse' : 'Expand'}
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                            expandedId === tenant.id
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700'
                              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {expandedId === tenant.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === tenant.id && (
                    <tr>
                      <td colSpan={3} className="bg-slate-50 px-6 py-5">
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
                  <td colSpan={3} className="px-6 py-12 text-center text-sm font-semibold text-slate-400">
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
