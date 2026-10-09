import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-4 py-2 text-sm font-medium rounded-lg',
    lg: 'px-5 py-2.5 text-base font-medium rounded-xl'
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-500/20 disabled:bg-blue-300',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-950 shadow-sm disabled:bg-slate-400',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 disabled:opacity-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm disabled:bg-rose-300',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
