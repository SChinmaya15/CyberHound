import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ elevated = true, className = '', children, ...props }) => (
  <div
    className={`rounded-3xl border ${elevated ? 'border-slate-200 shadow-sm' : 'border-transparent'} bg-white overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);
