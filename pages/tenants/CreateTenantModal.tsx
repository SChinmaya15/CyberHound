import React, { useState } from 'react';
import { X, Building, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { createTenant } from '../../services/tenantService';
import { Tenant } from './types';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTenant: (tenant: Tenant) => void;
}

const initialForm = {
  tenantName: '',
  tenantShortName: '',
  adminEmail: '',
  adminPassword: '',
};

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ isOpen, onClose, onCreateTenant }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const updateField = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.tenantName.trim()) {
      newErrors.tenantName = 'Tenant name is required';
    }
    if (!form.tenantShortName.trim()) {
      newErrors.tenantShortName = 'Tenant short name is required';
    }
    if (!form.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }
    if (!form.adminPassword.trim()) {
      newErrors.adminPassword = 'Admin password is required';
    } else if (form.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await createTenant({
        tenantName: form.tenantName.trim(),
        tenantShortName: form.tenantShortName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });

      onCreateTenant(created);
      handleClose();
    } catch (error: any) {
      setSubmitError(error?.message || 'Unable to create tenant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
              <Building size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create New Tenant</h2>
              <p className="text-sm text-slate-500">Add basic information to create a new tenant</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Tenant Name</label>
            <input
              type="text"
              value={form.tenantName}
              onChange={updateField('tenantName')}
              placeholder="Enter tenant name"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.tenantName
                  ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                  : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.tenantName && <p className="text-xs text-rose-600">{errors.tenantName}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Tenant Short Name</label>
            <input
              type="text"
              value={form.tenantShortName}
              onChange={updateField('tenantShortName')}
              placeholder="e.g., ACME"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.tenantShortName
                  ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                  : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.tenantShortName && <p className="text-xs text-rose-600">{errors.tenantShortName}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Admin Email</label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={updateField('adminEmail')}
                placeholder="admin@company.com"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                  errors.adminEmail
                    ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {errors.adminEmail && <p className="text-xs text-rose-600">{errors.adminEmail}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Admin Password</label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={updateField('adminPassword')}
                placeholder="••••••••"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                  errors.adminPassword
                    ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {errors.adminPassword && <p className="text-xs text-rose-600">{errors.adminPassword}</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Default Settings</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Plan:</span>
                <span>Trial (can be changed later)</span>
              </div>
              <p className="text-xs text-slate-500">You can add plan and settings after creation</p>
            </div>
          </div>

          {submitError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <AlertCircle size={18} className="mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 p-6">
          <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Building size={16} />}
            {isSubmitting ? 'Creating...' : 'Create Tenant'}
          </Button>
        </div>
      </div>
    </div>
  );
};
