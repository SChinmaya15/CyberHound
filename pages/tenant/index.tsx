import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, SlidersHorizontal, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TenantDetails } from './TenantDetails';
import { CreateTenantModal } from './CreateTenantModal';
import { Tenant } from './types';

const TENANT_DATA: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'krks travels pvt ltd',
    code: '14344621',
    email: 'kraj3838@gmail.com',
    plan: 'Enterprise',
    planStatus: 'Approval pending',
    expiry: '7/20/2026',
    isInactive: true,
    selected: true,
    tenantId: '6a4bc20f8f68c47b57a34bd6',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-2',
    name: 'FASFf',
    code: '24R2',
    email: 'kokajab475@lovadio.com',
    plan: 'Trial',
    planStatus: 'Approved',
    expiry: '7/18/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a48e33a8f68c47b57a33761',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-3',
    name: 'tokae',
    code: 'BOTE',
    email: 'xaciyp95408@lovadio.com',
    plan: 'Enterprise',
    planStatus: 'Approved',
    expiry: '7/17/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a476ce68f68c47b57a32d0a',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-4',
    name: 'TEST',
    code: 'XACJHB',
    email: 'aditya.jain+22@aionos.ai',
    plan: 'Trial',
    planStatus: 'Approved',
    expiry: '7/2/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a338d2aaccaa5fdbab95089',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-5',
    name: 'KAR',
    code: '456',
    email: 'karan@yopmail.com',
    plan: 'Enterprise',
    planStatus: 'Approved',
    expiry: '7/1/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a328b1ccacaa5fdbab93c92',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-6',
    name: 'BISH',
    code: '467',
    email: 'bish@yopmail.com',
    plan: 'Enterprise',
    planStatus: 'Approved',
    expiry: '6/26/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a2bdc1ec65af3f38fc4e1df',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-7',
    name: 'wewess',
    code: 'T54RFEMM',
    email: 'robinhooda66+133@gmail.com',
    plan: 'Trial',
    planStatus: 'Approved',
    expiry: '6/25/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a2a703e876155cc81027b8e',
    statusTag: 'Expired',
  },
  {
    id: 'tenant-8',
    name: 'AIONOS',
    code: 'AIONOS2222',
    email: 'aditya.jain+2222@aionos.ai',
    plan: 'Trial',
    planStatus: 'Approved',
    expiry: '6/24/2026',
    isInactive: true,
    selected: false,
    tenantId: '6a2914d7876155cc81025c3b',
    statusTag: 'Expired',
  },
];

const planOptions = ['All Plans', 'Enterprise', 'Trial'];

export const TenantPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All Plans');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionView, setActionView] = useState<'insights' | 'settings' | 'approve'>('insights');
  const [rows, setRows] = useState(TENANT_DATA);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTenants = useMemo(() => {
    return rows.filter((tenant) => {
      const matchesSearch = [tenant.name, tenant.email, tenant.code].some((value) =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesPlan = selectedPlan === 'All Plans' || tenant.plan === selectedPlan;
      return matchesSearch && matchesPlan;
    });
  }, [rows, searchTerm, selectedPlan]);

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

  const selectedTenant = rows.find((tenant) => tenant.id === expandedId) ?? rows[0];

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
              {filteredTenants.map((tenant) => (
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
