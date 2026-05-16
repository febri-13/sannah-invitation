export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-white/40">
        <div className="h-9 w-9 bg-gray-200 rounded-full" />
        <div className="h-7 w-40 bg-gray-200 rounded" />
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-6 lg:p-8">
        <div className="rounded-3xl p-6 md:p-8 bg-white/70 space-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          ))}
          <div className="h-12 bg-gray-200 rounded-full" />
        </div>
      </main>
    </div>
  );
}
