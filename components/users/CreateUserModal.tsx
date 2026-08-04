import React, { useState } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createUser } from '../../services/userService';
import { getTenantIdFromToken } from '../../services/authService';
import { CreateUserResponse, UserRole } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: CreateUserResponse) => void;
  tenantId?: string;
}

const ROLE_OPTIONS: UserRole[] = ['Agent', 'Admin', 'Manager'];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
  password: '',
  role: 'User' as UserRole,
};

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated, tenantId }) => {
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

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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

    const resolvedTenantId = tenantId || getTenantIdFromToken();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await createUser({
        tenantId: resolvedTenantId,
        email: form.email.trim(),
        userName: form.userName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        role: form.role,
      });

      onUserCreated(created);
      handleClose();
    } catch (error: any) {
      setSubmitError(error?.message || 'Unable to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
              <UserPlus size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Team Member</h2>
              <p className="text-sm text-slate-500">Invite a new user to this tenant</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={updateField('firstName')}
                placeholder="Jane"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                  errors.firstName
                    ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                    : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {errors.firstName && <p className="text-xs text-rose-600">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={updateField('lastName')}
                placeholder="Doe"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="jane.doe@company.com"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.email
                  ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                  : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Username</label>
              <input
                type="text"
                value={form.userName}
                onChange={updateField('userName')}
                placeholder="jane.doe"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Role</label>
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="••••••••"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 ${
                errors.password
                  ? 'border-rose-500 bg-rose-50 focus:ring-rose-100'
                  : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
          </div>

          {submitError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <AlertCircle size={18} className="mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
          <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {isSubmitting ? 'Creating...' : 'Add Team Member'}
          </Button>
        </div>
      </div>
    </div>
  );
};
