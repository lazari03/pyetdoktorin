import React from 'react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'xs';

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, children, className, ...props },
  ref
) {
  const variantClass =
    variant === 'primary'
      ? 'btn btn-primary'
      : variant === 'outline'
        ? 'btn btn-outline'
        : variant === 'ghost'
          ? 'btn btn-ghost'
          : 'btn btn-error';

  const sizeClass = size === 'xs' ? 'btn-xs' : '';

  return (
    <button
      ref={ref}
      className={cn(variantClass, sizeClass, loading && 'cursor-wait', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" aria-hidden />
      ) : null}
      {children}
    </button>
  );
});

