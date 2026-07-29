import React, { useState } from 'react';
import { Building, CreditCard, Users, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Tenant } from './types';

interface TenantSettingsProps {
  tenant: Tenant;
}

export const TenantSettings: React.FC<TenantSettingsProps> = ({ tenant }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'plan' | 'users'>('basic');
  const [name, setName] = useState(tenant.name);
  const [code, setCode] = useState(tenant.code);
  const [city, setCity] = useState('Madurai');
  const [maxUsers, setMaxUsers] = useState('1000');
  const [featureDepartments, setFeatureDepartments] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(tenant.plan);
  const [expiryDate, setExpiryDate] = useState('2026-07-20');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Settings</p>
          <h2 className="text-2xl font-bold text-slate-900">Manage your tenant configuration</h2>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Tenant Settings</p>
          <p className="text-sm text-slate-500">Configure tenant branding, domains, and system limits</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 bg-slate-100 p-2 rounded-3xl">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'basic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building size={16} /> Basic Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'plan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard size={16} /> Plan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} /> Users
        </button>
      </div>

      {activeTab === 'basic' && (
        <div className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">Basic Information</h3>
            <p className="text-sm text-slate-500">Update your tenant's basic information and identification</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tenant Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tenant Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                <option>Madurai</option>
                <option>Chennai</option>
                <option>Bengaluru</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Maximum Users</label>
              <input value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              <p className="text-xs text-slate-400">Maximum number of users allowed in your tenant as per plan</p>
            </div>
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Features</p>
                <p className="mt-2 text-sm text-slate-500">Enable or disable optional features for this tenant</p>
              </div>
              <label className="mt-4 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={featureDepartments} onChange={(e) => setFeatureDepartments(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Departments
              </label>
              <p className="mt-3 text-xs text-slate-400">Allow this tenant to create departments with managers and agents</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" size="md" onClick={() => { setName(tenant.name); setCode(tenant.code); setCity('Madurai'); setMaxUsers('1000'); setFeatureDepartments(false); }}>
              <RefreshCw size={16} /> Reset to Current
            </Button>
            <Button variant="primary" size="md">
              <Save size={16} /> Save Changes
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">Plan Management</h3>
            <p className="text-sm text-slate-500">Select and manage your tenant's subscription plan.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current Plan</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{tenant.plan}</p>
                <p className="text-sm text-slate-500">{tenant.plan} plan for large orgs with custom needs</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">Active</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select Plan</label>
              <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                <option>Enterprise</option>
                <option>Trial</option>
                <option>Startup</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Plan Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              <p className="text-xs text-rose-500">Expired 9 day(s) ago</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" size="md">
              Cancel
            </Button>
            <Button variant="primary" size="md">
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">User Management</h3>
            <p className="text-sm text-slate-500">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">1 of 1 users</p>
                <p className="text-sm font-semibold text-slate-900">Users</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                <button type="button" className="rounded-2xl bg-white px-4 py-2 text-slate-700 shadow-sm">Add User</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-500 uppercase tracking-[0.18em] text-[11px]">
                  <tr>
                    <th className="px-4 py-4">User</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Department</th>
                    <th className="px-4 py-4">Report To</th>
                    <th className="px-4 py-4">Created</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">ks</div>
                        <div>
                          <p className="font-semibold text-slate-900">kuttiraj sekar</p>
                          <p className="text-xs text-slate-500">kraj3838@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-900 font-semibold">ADMIN</td>
                    <td className="px-4 py-4 text-slate-500">Active</td>
                    <td className="px-4 py-4 text-slate-500">N/A</td>
                    <td className="px-4 py-4 text-slate-500">N/A</td>
                    <td className="px-4 py-4 text-slate-500">Jul 6, 2026</td>
                    <td className="px-4 py-4 text-slate-500">...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Showing 1 to 1 of 1 results</span>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Rows per page 25</div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <button type="button">⟨</button>
                <span>Page 1 of 1</span>
                <button type="button">⟩</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
