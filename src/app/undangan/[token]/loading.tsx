export default function Loading() {
  return (
    <div className="min-h-screen p-4 animate-pulse">
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-white/70 rounded-3xl p-6 flex flex-col items-center gap-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-40 w-40 bg-gray-200 rounded-2xl" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>

        <div className="bg-white/70 rounded-3xl p-5 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>

        <div className="bg-white/70 rounded-3xl p-5 space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 rounded-3xl p-5 space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-56 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 rounded-3xl p-5 space-y-4">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
