export default function KontenUndanganLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="glass-card p-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Event details skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Agenda skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Save button skeleton */}
        <div className="h-12 w-40 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
