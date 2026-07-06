import { Skeleton } from '@/presentation/ui/Skeleton';

export function SectionShellSkeleton() {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f5f6fa] overflow-hidden" role="status" aria-label="Loading application layout">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between h-14 shrink-0 bg-white border-b border-gray-200 px-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:h-full shrink-0 border-r border-gray-200 bg-white w-[248px]">
        <div className="flex items-center h-[68px] shrink-0 px-5 gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
        <Skeleton className="mx-5 h-3 w-16" />
        <nav className="flex-1 px-3 py-1 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl py-2.5 px-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto pt-14 md:pt-0">
        {/* Desktop top bar */}
        <header className="hidden md:flex items-center gap-2 lg:gap-4 sticky top-0 bg-white border-b border-gray-200 px-3 lg:px-6 h-[68px] shrink-0">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="hidden lg:flex flex-col shrink-0 gap-1">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex-1 min-w-0 max-w-[200px] lg:max-w-xs mx-1 lg:mx-4">
            <Skeleton className="h-9 w-full rounded-full" />
          </div>
          <div className="flex items-center gap-1 lg:gap-2 ml-auto">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="hidden lg:block h-6 w-px" />
            <div className="flex items-center gap-2 ml-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="hidden lg:block h-4 w-20" />
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 min-w-0 px-4 md:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/6" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
