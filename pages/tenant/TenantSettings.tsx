import React, { useCallback, useEffect, useState } from 'react';
import {
  Building,
  CreditCard,
  Users,
  RefreshCw,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Mail,
  Trash2,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CreateUserModal } from '../../components/users/CreateUserModal';
import { Tenant } from './types';
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionByTenant,
  updateSubscription,
} from '../../services/subscriptionService';
import { getUsers } from '../../services/userService';
import { CreateUserResponse, Subscription, SubscriptionModel, TeamMember } from '../../types';

interface TenantSettingsProps {
  tenant: Tenant;
}

const subscriptionModels: { value: SubscriptionModel; label: string; description: string }[] = [
  { value: 'PayPerUse', label: 'Pay per use', description: 'Meter tenant activity and bill on actual usage.' },
  { value: 'UserBased', label: 'User based', description: 'Bill by active users under this tenant.' },
  { value: 'PayPerScan', label: 'Pay per scan', description: 'Charge for each completed scan run.' },
  { value: 'OneTimeCharge', label: 'One-time charge', description: 'Single commercial agreement or trial setup.' },
];

const toDateInputValue = (date?: string | null): string => {
  if (!date) {
    return '';
  }

  return date.slice(0, 10);
};

const formatLastLogin = (lastLoginAt: string | null): string => {
  if (!lastLoginAt) {
    return 'Never';
  }

  const date = new Date(lastLoginAt);
  if (Number.isNaN(date.getTime())) {
    return 'Never';
  }

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const TenantSettings: React.FC<TenantSettingsProps> = ({ tenant }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'subscription' | 'users'>('basic');
  const [name, setName] = useState(tenant.name);
  const [code, setCode] = useState(tenant.code);
  const [city, setCity] = useState('Madurai');
  const [maxUsers, setMaxUsers] = useState('1000');
  const [featureDepartments, setFeatureDepartments] = useState(false);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [subscriptionError, setSubscriptionError] = useState('');
  const [subscriptionForm, setSubscriptionForm] = useState({
    planName: '',
    model: 'PayPerUse' as SubscriptionModel,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const applySubscription = (nextSubscription: Subscription | null) => {
    setSubscription(nextSubscription);

    if (!nextSubscription) {
      setSubscriptionForm({
        planName: '',
        model: 'PayPerUse',
        isActive: true,
        startDate: '',
        endDate: '',
      });
      return;
    }

    setSubscriptionForm({
      planName: nextSubscription.planName ?? '',
      model: nextSubscription.model ?? 'PayPerUse',
      isActive: nextSubscription.isActive ?? true,
      startDate: toDateInputValue(nextSubscription.startDate),
      endDate: toDateInputValue(nextSubscription.endDate),
    });
  };

  const getSubscriptionId = (currentSubscription: Subscription | null): string => (
    currentSubscription?.subscriptionId ?? currentSubscription?.id ?? ''
  );

  const loadSubscription = useCallback(async () => {
    setIsLoadingSubscription(true);
    setSubscriptionError('');
    setSubscriptionMessage('');

    try {
      const loaded = await getSubscriptionByTenant(tenant.tenantId);
      applySubscription(loaded);
    } catch (error: any) {
      if (String(error?.message ?? '').includes('404')) {
        applySubscription(null);
        setSubscriptionMessage('No subscription exists for this tenant yet.');
      } else {
        setSubscriptionError(error?.message || 'Unable to load subscription.');
      }
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [tenant.tenantId]);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError('');

    try {
      const allUsers = await getUsers();
      setMembers(allUsers.filter((member) => member.tenantId === tenant.tenantId));
    } catch (error: any) {
      setUsersError(error?.message || 'Unable to load users.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [tenant.tenantId]);

  useEffect(() => {
    loadSubscription();
    loadUsers();
  }, [loadSubscription, loadUsers]);

  const handleSubscriptionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSavingSubscription(true);
    setSubscriptionError('');
    setSubscriptionMessage('');

    const payload = {
      model: subscriptionForm.model,
      planName: subscriptionForm.planName.trim(),
      startDate: subscriptionForm.startDate || null,
      endDate: subscriptionForm.endDate || null,
    };

    try {
      if (subscription) {
        const subscriptionId = getSubscriptionId(subscription);

        if (!subscriptionId) {
          setSubscriptionError('Subscription ID was not returned by the API, so the subscription cannot be updated.');
          return;
        }
      }

      const saved = subscription
        ? await updateSubscription(tenant.tenantId, {
            ...payload,
            isActive: subscriptionForm.isActive,
            subscriptionId: getSubscriptionId(subscription),
          })
        : await createSubscription({ tenantId: tenant.tenantId, ...payload });

      applySubscription(saved);
      setSubscriptionMessage(subscription ? 'Subscription updated successfully.' : 'Subscription created successfully.');
    } catch (error: any) {
      setSubscriptionError(error?.message || 'Unable to save subscription.');
    } finally {
      setIsSavingSubscription(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!subscription) {
      return;
    }

    const confirmed = window.confirm('Delete this tenant subscription?');
    if (!confirmed) {
      return;
    }

    setIsDeletingSubscription(true);
    setSubscriptionError('');
    setSubscriptionMessage('');

    try {
      await deleteSubscription(tenant.tenantId);
      applySubscription(null);
      setSubscriptionMessage('Subscription deleted.');
    } catch (error: any) {
      setSubscriptionError(error?.message || 'Unable to delete subscription.');
    } finally {
      setIsDeletingSubscription(false);
    }
  };

  const handleUserCreated = (_created: CreateUserResponse) => {
    loadUsers();
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Settings</p>
          <h2 className="text-2xl font-bold text-slate-900">Tenant configuration</h2>
          <p className="mt-1 text-sm text-slate-500">Basic profile, subscription, and user access for this tenant.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'basic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building size={16} /> Basic
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subscription')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'subscription' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard size={16} /> Subscription
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} /> User Management
        </button>
      </div>

      {activeTab === 'basic' && (
        <div className="mt-6 space-y-6 rounded-[24px] border border-slate-200 bg-white p-6">
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

      {activeTab === 'subscription' && (
        <div className="mt-6 space-y-6 rounded-[24px] border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-900">Subscription</h3>
              <p className="text-sm text-slate-500">Select and manage this tenant's subscription plan.</p>
            </div>
            <button
              type="button"
              onClick={() => loadSubscription()}
              disabled={isLoadingSubscription}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingSubscription ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh
            </button>
          </div>

          {isLoadingSubscription ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin text-indigo-600" />
              Loading subscription
            </div>
          ) : (
            <form onSubmit={handleSubscriptionSubmit} className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current Subscription</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{subscription?.planName || 'No plan set'}</p>
                    <p className="text-sm text-slate-500">{subscription ? `${subscription.model} billing model` : 'Create a subscription for this tenant below.'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    subscription?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {subscription ? (subscription.isActive ? 'Active' : 'Inactive') : 'Not Configured'}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Plan Name</label>
                  <input
                    type="text"
                    value={subscriptionForm.planName}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, planName: event.target.value }))}
                    placeholder="Enterprise Trial"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subscription Status</label>
                  <button
                    type="button"
                    onClick={() => setSubscriptionForm((current) => ({ ...current, isActive: !current.isActive }))}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                      subscriptionForm.isActive
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>{subscriptionForm.isActive ? 'Active' : 'Inactive'}</span>
                    <span className={`relative h-5 w-9 rounded-full transition-colors ${subscriptionForm.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${subscriptionForm.isActive ? 'left-4' : 'left-0.5'}`} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Billing Model</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {subscriptionModels.map((model) => (
                    <label
                      key={model.value}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        subscriptionForm.model === model.value
                          ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tenantSubscriptionModel"
                        value={model.value}
                        checked={subscriptionForm.model === model.value}
                        onChange={() => setSubscriptionForm((current) => ({ ...current, model: model.value }))}
                        className="sr-only"
                      />
                      <span className="block text-sm font-bold text-slate-800">{model.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{model.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={subscriptionForm.startDate}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, startDate: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subscription Expiry Date</label>
                  <input
                    type="date"
                    value={subscriptionForm.endDate}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, endDate: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {(subscriptionError || subscriptionMessage) && (
                <div className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  subscriptionError ? 'border-rose-100 bg-rose-50 text-rose-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'
                }`}>
                  {subscriptionError ? <AlertCircle size={18} className="mt-0.5" /> : <CheckCircle2 size={18} className="mt-0.5" />}
                  <p className="text-sm font-semibold">{subscriptionError || subscriptionMessage}</p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleDeleteSubscription}
                  disabled={!subscription || isDeletingSubscription || isSavingSubscription}
                  className="border-rose-100 text-rose-600 hover:bg-rose-50"
                >
                  {isDeletingSubscription ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  Delete Subscription
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={isSavingSubscription}>
                  {isSavingSubscription ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {subscription ? 'Update Subscription' : 'Create Subscription'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-6 space-y-6 rounded-[24px] border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-900">User Management</h3>
              <p className="text-sm text-slate-500">Manage user accounts for this tenant</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadUsers()}
                disabled={isLoadingUsers}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingUsers ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh
              </button>
              <Button variant="primary" size="md" onClick={() => setIsCreateUserModalOpen(true)}>
                <Plus size={16} /> Add User
              </Button>
            </div>
          </div>

          {usersError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <AlertCircle size={18} className="mt-0.5" />
              <span>{usersError}</span>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">{members.length} user{members.length === 1 ? '' : 's'}</p>
                <p className="text-sm font-semibold text-slate-900">Users</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-500 uppercase tracking-[0.18em] text-[11px]">
                  <tr>
                    <th className="px-4 py-4">User</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Last Login</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm font-semibold text-slate-400">
                        <Loader2 size={18} className="mx-auto animate-spin text-indigo-600" />
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm font-semibold text-slate-400">
                        No users found for this tenant
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                              <Users size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Shield size={14} className="text-indigo-500" />
                            <span className="font-semibold text-slate-700">{member.role}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            member.lastLoginAt ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {formatLastLogin(member.lastLoginAt)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                            <Mail size={16} />
                          </button>
                          <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={handleUserCreated}
        tenantId={tenant.tenantId}
      />
    </div>
  );
};
