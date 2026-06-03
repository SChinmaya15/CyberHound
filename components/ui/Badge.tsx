import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger: 'bg-rose-100 text-rose-700 border border-rose-200',
  info: 'bg-sky-100 text-sky-700 border border-sky-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', children, ...props }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${variantStyles[variant]} ${className}`} {...props}>
    {children}
  </span>
);
