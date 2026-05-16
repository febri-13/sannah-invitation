export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4 border-b border-white/40">
        <div className="h-7 w-48 bg-gray-200 rounded" />
        <div className="h-9 w-24 bg-gray-200 rounded-full" />
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-5 flex items-center gap-4 bg-white/70">
              <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-7 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl p-8 flex flex-col items-center bg-white/70">
          <div className="w-36 h-36 rounded-full bg-gray-200" />
          <div className="h-4 w-48 bg-gray-200 rounded mt-4" />
        </section>

        <section className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 w-36 bg-white/70 rounded-full" />
          ))}
        </section>

        <section className="rounded-2xl bg-white/70 p-4">
          <div className="h-10 bg-gray-200 rounded-lg mb-4 w-64" />
          <div className="h-10 bg-gray-200 rounded-lg mb-4 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
