export function CardSkeleton() {
  return (
    <div className="bg-bg-card rounded-2xl overflow-hidden border border-gray-800">
      <div className="h-48 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 shimmer rounded-lg w-3/4" />
        <div className="h-4 shimmer rounded-lg w-1/2" />
        <div className="h-4 shimmer rounded-lg w-2/3" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 shimmer rounded-lg flex-1" />
          <div className="h-8 shimmer rounded-lg w-16" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-bg-card rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-800">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 shimmer rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-gray-800/50">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 shimmer rounded flex-1" style={{ opacity: 1 - j * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-bg-card rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 shimmer rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 shimmer rounded-lg w-48" />
            <div className="h-4 shimmer rounded-lg w-64" />
            <div className="h-4 shimmer rounded-lg w-36" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-bg-card rounded-2xl p-4 border border-gray-800 space-y-2">
            <div className="h-4 shimmer rounded w-1/2" />
            <div className="h-8 shimmer rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-bg-card rounded-2xl p-5 border border-gray-800 space-y-3">
          <div className="h-4 shimmer rounded w-1/2" />
          <div className="h-8 shimmer rounded w-3/4" />
          <div className="h-3 shimmer rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

export default function SkeletonLoader({ type = 'card', count = 3, rows, cols }) {
  if (type === 'table') return <TableSkeleton rows={rows} cols={cols} />
  if (type === 'profile') return <ProfileSkeleton />
  if (type === 'stats') return <StatsSkeleton />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
