export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-pulse">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-6 md:p-8 bg-white/70 flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
          <div className="h-12 w-full bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
