'use client';

import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/presentation/ui/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, cols = 4, className = '' }: TableSkeletonProps) {
  const { t } = useTranslation();
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label={t('loadingTable') || 'Loading table'}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-5 ${j === 0 ? 'w-1/3' : j === cols - 1 ? 'w-1/6' : 'w-1/4'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
