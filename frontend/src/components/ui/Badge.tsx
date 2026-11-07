import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'orange' | 'green' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'blue', size = 'sm', className = '' }: BadgeProps) {
  const variantStyles = {
    blue: 'bg-brand-light text-brand-primary border border-brand-primary/20',
    orange: 'bg-accent-light text-accent-orange border border-accent-orange/20 font-semibold',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-xs md:text-sm px-3 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

