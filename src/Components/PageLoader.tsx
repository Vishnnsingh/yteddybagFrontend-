interface PageLoaderProps {
  message?: string;
  minHeight?: string;
}

export default function PageLoader({
  message = 'Loading collections...',
  minHeight = 'min-h-[60vh]',
}: PageLoaderProps) {
  return (
    <div
      className={`w-full ${minHeight} flex flex-col items-center justify-center p-6 text-center select-none`}
    >
      <div className="relative flex items-center justify-center mb-3">
        {/* Subtle glowing halo */}
        <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#D26900]/20 to-[#E65100]/10 blur-md animate-pulse" />
        {/* Circular Theme Spinner */}
        <div className="w-12 h-12 rounded-full border-[3.5px] border-amber-100 border-t-[#D26900] border-r-[#E65100] animate-spin shadow-xs" />
      </div>
      {message && (
        <p className="text-xs sm:text-sm font-semibold text-gray-700 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
