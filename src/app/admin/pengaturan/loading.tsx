export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-white/40">
        <div className="h-9 w-9 bg-gray-200 rounded-full" />
        <div className="h-7 w-40 bg-gray-200 rounded" />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="rounded-3xl p-6 md:p-8 bg-white/70 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-48 w-full bg-gray-200 rounded-2xl" />
          </div>

          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
              ))}
            </div>
          </div>

          <div className="h-12 w-full bg-gray-200 rounded-full" />
        </div>
      </main>
    </div>
  );
}
