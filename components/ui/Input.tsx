import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', ...props }, ref) => (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
      <input
        ref={ref}
        className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${error ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-200'} `}
        {...props}
      />
      {helperText && <p className="text-xs text-slate-400">{helperText}</p>}
      {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
