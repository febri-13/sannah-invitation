export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-white/40">
        <div className="h-9 w-9 bg-gray-200 rounded-full" />
        <div className="h-7 w-48 bg-gray-200 rounded" />
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-6 lg:p-8">
        <div className="rounded-3xl p-6 md:p-8 bg-white/70 space-y-6">
          <div className="rounded-2xl p-5 bg-white/50 space-y-3">
            <div className="h-5 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-16 w-full bg-gray-200 rounded-xl" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>

          <div className="h-32 bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300" />

          <div className="h-12 bg-gray-200 rounded-full" />
        </div>
      </main>
    </div>
  );
}
