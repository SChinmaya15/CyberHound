import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-200',
  ghost: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100',
  outline: 'bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
