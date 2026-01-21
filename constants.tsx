
import React from 'react';

export const CyberHoundMascot: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 5L12 3L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="7" y="5" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="10" cy="8" r="1" fill="currentColor"/>
    <circle cx="14" cy="8" r="1" fill="currentColor"/>
    <path d="M9 13V18C9 19.1046 9.89543 20 11 20H13C14.1046 20 15 19.1046 15 18V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 10H5C3.89543 10 3 10.8954 3 12V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 10H19C20.1046 10 21 10.8954 21 12V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M11 11H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 11V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const COLORS = {
  primary: '#6366f1', // Indigo 500
  secondary: '#0ea5e9', // Sky 500
  danger: '#f43f5e', // Rose 500
  warning: '#f59e0b', // Amber 500
  success: '#10b981', // Emerald 500
  dark: '#0f172a',
};
