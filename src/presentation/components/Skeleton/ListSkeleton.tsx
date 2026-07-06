import { Skeleton } from '@/presentation/ui/Skeleton';

interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 4, className = '' }: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
