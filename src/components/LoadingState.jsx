export default function LoadingState({ step = 'Fetching page…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-primary-200" />
        <div className="absolute inset-0 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-surface-600 font-medium">{step}</p>
      <p className="text-sm text-surface-500 mt-1">This may take a moment</p>
    </div>
  );
}
