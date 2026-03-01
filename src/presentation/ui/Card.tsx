import React from 'react';
import { cn } from './cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('card', className)} {...props} />;
}

