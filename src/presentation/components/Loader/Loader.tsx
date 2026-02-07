export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-purple-50/30">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-purple-200/60" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-400 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-20 blur-[6px]" />
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.1s]" />
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
        </div>
        <p className="text-xs text-gray-500">Loading</p>
      </div>
    </div>
  );
}
