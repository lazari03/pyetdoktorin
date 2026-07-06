import { Skeleton } from '@/presentation/ui/Skeleton';

interface StatsPageSkeletonProps {
  cardCount?: number;
  className?: string;
}

export function StatsPageSkeleton({ cardCount = 4, className = '' }: StatsPageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading stats page">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
