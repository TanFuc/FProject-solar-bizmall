import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'orange' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'orange',
  size = 'md',
  href,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    orange:
      'bg-accent-orange hover:bg-accent-hover text-white shadow-cta focus:ring-accent-orange border border-transparent',
    primary:
      'bg-brand-primary hover:bg-brand-dark text-white shadow-sm focus:ring-brand-primary border border-transparent',
    outline:
      'bg-transparent hover:bg-white/10 text-white border-2 border-white/80 focus:ring-white',
    ghost:
      'bg-transparent hover:bg-surface text-ink hover:text-brand-primary border border-transparent focus:ring-brand-primary',
    white:
      'bg-white hover:bg-slate-50 text-brand-primary font-bold shadow-md hover:shadow-lg focus:ring-white border border-transparent',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
    fullWidth ? 'w-full' : ''
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {icon && iconPosition === 'left' && <span className="inline-flex">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="inline-flex">{icon}</span>}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {icon && iconPosition === 'left' && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex">{icon}</span>}
    </button>
  );
}

