import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'lost' | 'found';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1'
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    lost: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    found: 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
