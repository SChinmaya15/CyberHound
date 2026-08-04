import React, { useState } from 'react';
import { X, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Tenant } from './types';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTenant: (tenant: Tenant) => void;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({ isOpen, onClose, onCreateTenant }) => {
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [city, setCity] = useState('Madurai');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!tenantName.trim()) {
      newErrors.tenantName = 'Tenant name is required';
    }
    if (!tenantCode.trim()) {
      newErrors.tenantCode = 'Tenant code is required';
    }
    if (!tenantEmail.trim()) {
      newErrors.tenantEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantEmail)) {
      newErrors.tenantEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) {
      return;
    }

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      tenantId: `tenant_${Math.random().toString(36).substr(2, 9)}`,
      name: tenantName,
      code: tenantCode,
      email: tenantEmail,
      plan: 'Trial',
      planStatus: 'Pending',
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
      isInactive: true,
      selected: false,
      statusTag: 'Active',
    };

    onCreateTenant(newTenant);

    // Reset form
    setTenantName('');
    setTenantCode('');
    setTenantEmail('');
    setCity('Madurai');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
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
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Tenant Name</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => {
                setTenantName(e.target.value);
                if (errors.tenantName) {
                  setErrors({ ...errors, tenantName: '' });
                }
              }}
              placeholder="Enter tenant name"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.tenantName
                  ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                  : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.tenantName && <p className="text-xs text-rose-600">{errors.tenantName}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Tenant Code</label>
              <input
                type="text"
                value={tenantCode}
                onChange={(e) => {
                  setTenantCode(e.target.value);
                  if (errors.tenantCode) {
                    setErrors({ ...errors, tenantCode: '' });
                  }
                }}
                placeholder="e.g., TENANT001"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                  errors.tenantCode
                    ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {errors.tenantCode && <p className="text-xs text-rose-600">{errors.tenantCode}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option>Madurai</option>
                <option>Chennai</option>
                <option>Bengaluru</option>
                <option>Mumbai</option>
                <option>Delhi</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={tenantEmail}
              onChange={(e) => {
                setTenantEmail(e.target.value);
                if (errors.tenantEmail) {
                  setErrors({ ...errors, tenantEmail: '' });
                }
              }}
              placeholder="Enter primary email"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.tenantEmail
                  ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                  : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.tenantEmail && <p className="text-xs text-rose-600">{errors.tenantEmail}</p>}
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
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleCreate}>
            Create Tenant
          </Button>
        </div>
      </div>
    </div>
  );
};
