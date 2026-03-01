import React from 'react';
import { cn } from './cn';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn('input input-bordered', className)} {...props} />;
});

