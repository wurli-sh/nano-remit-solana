import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-5', className)}>
      {children}
    </div>
  )
}

// Dashboard-specific skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Tier hero card */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-gray-100 to-gray-50 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-1 h-6 w-12" />
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-right">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1 h-6 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-2 h-4 w-40" />
          </SkeletonCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i}>
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <Skeleton className="size-5 rounded-lg" />
                <Skeleton className="h-4 w-20" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <Skeleton className="mb-3 h-5 w-32" />
        <SkeletonCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  )
}

// Mint page skeleton
export function MintSkeleton() {
  return (
    <div className="space-y-6">
      {/* Centered header */}
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>

      {/* Main content card */}
      <SkeletonCard className="p-8">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="flex justify-center">
            <Skeleton className="size-16 rounded-2xl" />
          </div>
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-6 w-40" />
            <Skeleton className="mx-auto h-4 w-64" />
            <Skeleton className="mx-auto h-4 w-56" />
          </div>
          <SkeletonCard className="space-y-3 bg-gray-50">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </SkeletonCard>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </SkeletonCard>
    </div>
  )
}

// Vault page skeleton
export function VaultSkeleton() {
  return (
    <div className="space-y-8">
      {/* Centered header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Tab bar */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-96 rounded-full" />
      </div>

      {/* Tab content */}
      <SkeletonCard className="p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          
          <div className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </SkeletonCard>
    </div>
  )
}
