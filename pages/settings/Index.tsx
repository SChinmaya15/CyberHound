
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Building, 
  Users, 
  Lock, 
  Plus, 
  Mail, 
  Trash2, 
  Shield, 
  Globe, 
  Save,
  CheckCircle2,
  CreditCard,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
  XCircle
} from 'lucide-react';
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionByTenant,
  updateSubscription,
} from '../../services/subscriptionService';
import { CreateUserResponse, Subscription, SubscriptionModel, TeamMember } from '../../types';
import { getTenantIdFromToken, isSuperAdmin } from '../../services/authService';
import { getUsers } from '../../services/userService';
import { CreateUserModal } from '../../components/users/CreateUserModal';

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

const SettingsPage: React.FC = () => {
  const canManageTenant = isSuperAdmin();
  const [activeTab, setActiveTab] = useState<'basic' | 'users' | 'email' | 'subscription'>(canManageTenant ? 'basic' : 'subscription');
  const [tenantId] = useState(getTenantIdFromToken);
  const [showSaved, setShowSaved] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [subscriptionError, setSubscriptionError] = useState('');
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const previousActiveTab = useRef<typeof activeTab | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    planName: '',
    model: 'PayPerUse' as SubscriptionModel,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError('');

    try {
      const loaded = await getUsers();
      setUsers(loaded);
    } catch (error: any) {
      setUsersError(error?.message || 'Unable to load users.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const handleUserCreated = (_created: CreateUserResponse) => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
    loadUsers();
  };

  const applySubscription = (nextSubscription: Subscription | null) => {
    setSubscription(nextSubscription);

    if (!nextSubscription) {
      setSubscriptionForm((current) => ({
        ...current,
        planName: '',
        model: 'PayPerUse',
        isActive: true,
        startDate: '',
        endDate: '',
      }));
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
    if (!tenantId) {
      setSubscriptionError('Tenant ID was not found in the current session token.');
      return;
    }

    setIsLoadingSubscription(true);
    setSubscriptionError('');
    setSubscriptionMessage('');

    try {
      const loaded = await getSubscriptionByTenant(tenantId);
      applySubscription(loaded);
      setSubscriptionMessage('Subscription loaded.');
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
  }, [tenantId]);

  useEffect(() => {
    const landedOnSubscription = activeTab === 'subscription' && previousActiveTab.current !== 'subscription';
    const landedOnUsers = activeTab === 'users' && previousActiveTab.current !== 'users';

    if (landedOnSubscription && tenantId && !isLoadingSubscription) {
      loadSubscription();
    }

    if (landedOnUsers && !isLoadingUsers) {
      loadUsers();
    }

    previousActiveTab.current = activeTab;
  }, [activeTab, isLoadingSubscription, isLoadingUsers, loadSubscription, loadUsers, tenantId]);

  const handleSubscriptionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!tenantId) {
      setSubscriptionError('Tenant ID was not found in the current session token.');
      return;
    }

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
        ? await updateSubscription(tenantId, {
            ...payload,
            isActive: subscriptionForm.isActive,
            subscriptionId: getSubscriptionId(subscription),
          })
        : await createSubscription({ tenantId, ...payload });

      applySubscription(saved);
      setSubscriptionMessage(subscription ? 'Subscription updated successfully.' : 'Subscription created successfully.');
    } catch (error: any) {
      setSubscriptionError(error?.message || 'Unable to save subscription.');
    } finally {
      setIsSavingSubscription(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!tenantId || !subscription) {
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
      await deleteSubscription(tenantId);
      applySubscription(null);
      setSubscriptionMessage('Subscription deleted.');
    } catch (error: any) {
      setSubscriptionError(error?.message || 'Unable to delete subscription.');
    } finally {
      setIsDeletingSubscription(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Manage tenant preferences, subscription, and team access</p>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
        {canManageTenant && (
          <button 
            onClick={() => setActiveTab('basic')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'basic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building size={16} />
            <span>Basic</span>
          </button>
        )}
        {!canManageTenant && (
          <button 
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'subscription' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCard size={16} />
            <span>Subscription</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} />
          <span>User Management</span>
        </button>
        {canManageTenant && (
          <button 
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail size={16} />
            <span>Email Setup</span>
          </button>
        )}
      </div>

      {activeTab === 'basic' && canManageTenant ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <Globe size={18} className="text-indigo-600" />
                  <span>General Preferences</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Enterprise Domain</label>
                    <input type="text" defaultValue="enterprise-shield.cloud" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Default Storage Region</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>US-East (N. Virginia)</option>
                      <option>EU-Central (Frankfurt)</option>
                      <option>AP-South (Singapore)</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-8 border-t border-slate-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <Lock size={18} className="text-indigo-600" />
                  <span>Security & Vaulting</span>
                </h3>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-indigo-900">Tenant-Level Credentials</p>
                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    Allow scans to reuse shared credentials stored at the tenant level. This is more secure and easier to manage than providing keys per scan.
                  </p>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-slate-400">
                  <Plus size={20} />
                  <span className="text-sm font-medium">Add tenant-wide AWS Access Key</span>
                </div>
              </section>

              <div className="pt-6 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <Save size={18} />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h4 className="font-bold text-slate-800">Compliance Health</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">Your tenant is currently following all 12 SOC2-Type 2 automated PII discovery requirements.</p>
              <button className="text-xs font-bold text-indigo-600 border border-indigo-100 rounded-lg px-4 py-2 hover:bg-indigo-50 transition-all">Download Audit Report</button>
            </div>
          </div>
        </div>
      ) : activeTab === 'subscription' && !canManageTenant ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-300">
          <form onSubmit={handleSubscriptionSubmit} className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <CreditCard size={18} className="text-indigo-600" />
                  <span>Tenant Subscription</span>
                </h3>
                <button
                  type="button"
                  onClick={() => loadSubscription()}
                  disabled={isLoadingSubscription || !tenantId}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingSubscription ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  <span>Load</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={subscriptionForm.planName}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, planName: event.target.value }))}
                    placeholder="Enterprise Trial"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subscription Status</label>
                  <button
                    type="button"
                    onClick={() => setSubscriptionForm((current) => ({ ...current, isActive: !current.isActive }))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-between ${
                      subscriptionForm.isActive
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span>{subscriptionForm.isActive ? 'Active' : 'Inactive'}</span>
                    <span className={`w-10 h-5 rounded-full relative transition-colors ${
                      subscriptionForm.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                        subscriptionForm.isActive ? 'right-0.5' : 'left-0.5'
                      }`}></span>
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-8 border-t border-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Calendar size={18} className="text-indigo-600" />
                <span>Billing Model</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptionModels.map((model) => (
                  <label
                    key={model.value}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      subscriptionForm.model === model.value
                        ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscriptionModel"
                      value={model.value}
                      checked={subscriptionForm.model === model.value}
                      onChange={() => setSubscriptionForm((current) => ({ ...current, model: model.value }))}
                      className="sr-only"
                    />
                    <span className="block text-sm font-bold text-slate-800">{model.label}</span>
                    <span className="block text-xs text-slate-500 mt-1">{model.description}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4 pt-8 border-t border-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Calendar size={18} className="text-indigo-600" />
                <span>Subscription Window</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Start Date</label>
                  <input
                    type="date"
                    value={subscriptionForm.startDate}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, startDate: event.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">End Date</label>
                  <input
                    type="date"
                    value={subscriptionForm.endDate}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, endDate: event.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </section>

            {(subscriptionError || subscriptionMessage) && (
              <div className={`flex items-start space-x-3 rounded-2xl p-4 border ${
                subscriptionError ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
                {subscriptionError ? <AlertCircle size={18} className="mt-0.5" /> : <CheckCircle2 size={18} className="mt-0.5" />}
                <p className="text-sm font-semibold">{subscriptionError || subscriptionMessage}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleDeleteSubscription}
                disabled={!subscription || isDeletingSubscription || isSavingSubscription}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 border border-rose-100 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingSubscription ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                <span>Delete Subscription</span>
              </button>
              <button
                type="submit"
                disabled={isSavingSubscription}
                className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingSubscription ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{subscription ? 'Update Subscription' : 'Create Subscription'}</span>
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-800">Current State</h4>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  subscription ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {subscription ? 'Configured' : 'Not Set'}
                </span>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model</dt>
                  <dd className="text-sm font-semibold text-slate-700 mt-1">{subscription?.model ?? subscriptionForm.model}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</dt>
                  <dd className="text-sm font-semibold text-slate-700 mt-1">{subscription?.planName || subscriptionForm.planName || 'Unspecified'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</dt>
                  <dd className="text-sm font-semibold text-slate-700 mt-1">{subscriptionForm.isActive ? 'Active' : 'Inactive'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</dt>
                  <dd className="text-sm font-semibold text-slate-700 mt-1">{toDateInputValue(subscription?.startDate) || subscriptionForm.startDate || 'No start date'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End</dt>
                  <dd className="text-sm font-semibold text-slate-700 mt-1">{toDateInputValue(subscription?.endDate) || subscriptionForm.endDate || 'No end date'}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      ) : activeTab === 'email' && canManageTenant ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Mail size={18} className="text-indigo-600" />
                <span>Email Setup</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">SMTP Host</label>
                  <input type="text" placeholder="smtp.company.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">SMTP Port</label>
                  <input type="number" placeholder="587" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sender Email</label>
                  <input type="email" placeholder="security@company.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sender Name</label>
                  <input type="text" placeholder="CyberHound Alerts" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-8 border-t border-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Lock size={18} className="text-indigo-600" />
                <span>Authentication</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                  <input type="text" placeholder="smtp-user" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                </div>
              </div>
            </section>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Save size={18} />
                <span>Save Email Setup</span>
              </button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h4 className="font-bold text-slate-800">Notification Channel</h4>
              <p className="text-xs text-slate-400 mt-1">Configure the sender used for account invites, tenant updates, and scan notifications.</p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Manage Team Access</h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => loadUsers()}
                disabled={isLoadingUsers}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingUsers ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
              >
                <Plus size={16} />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          {usersError && (
            <div className="flex items-start space-x-3 bg-rose-50 border-b border-rose-100 text-rose-700 p-4">
              <AlertCircle size={18} className="mt-0.5" />
              <p className="text-sm font-semibold">{usersError}</p>
            </div>
          )}

          {isLoadingUsers ? (
            <div className="flex items-center justify-center gap-3 p-10 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin text-indigo-600" />
              Loading users
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Last Login</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center space-x-2">
                        <Shield size={14} className="text-indigo-500" />
                        <span className="text-sm font-medium text-slate-600">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.lastLoginAt ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {formatLastLogin(user.lastLoginAt)}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right space-x-2">
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                        <Mail size={18} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-sm font-semibold text-slate-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showSaved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="text-sm font-bold">Settings saved successfully</span>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default SettingsPage;
